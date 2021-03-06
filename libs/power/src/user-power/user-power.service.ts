import { GraphQLError } from 'graphql';
import * as uuid from 'uuid';
import { PartialModelObject, Transaction } from 'objection';

import { Injectable } from '@nestjs/common';
import { Account } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { UserProgramme } from '../user-programme';
import { Programme } from '../programme';
import { UserWorkout } from '../user-workout';
import { UserWorkoutWeek } from '../user-workout-week';
import { AuthContext, WorkoutOrder } from '../types';
import { ScheduledWorkoutService } from '../scheduled-workout';
import { WorkoutFeedbackService } from '../feedback';
import { UserExerciseHistory } from '../user-exercise-history/user-exercise-history.model';
import Knex from 'knex';
import { WorkoutType } from '../workout';
import { CompleteWorkoutDto } from './dto/complete-workout.dto';

async function findMostRecentWeek(
  accountId: string,
  trainingProgrammeId: string,
  opts: { transaction?: Transaction } = {},
) {
  const week = await UserWorkoutWeek.query(opts.transaction)
    .alias('uww')
    .select('uww.id', 'uww.week_number', 'uww.user_training_programme_id')
    .joinRelated('userTrainingProgramme', { alias: 'utp' })
    .where('utp.account_id', accountId)
    .where('utp.training_programme_id', trainingProgrammeId)
    .orderBy('uww.created_at', 'DESC')
    .limit(1)
    .first();

  if (week) {
    return {
      userTrainingProgrammeId: week.userTrainingProgrammeId,
      weekNumber: week.weekNumber,
    };
  } else {
    return null;
  }
}

type UserProgrammeInfo = {
  accountId: string;
  trainingProgrammeId?: string;
  userTrainingProgrammeId?: string;
  weekNumber?: number;
};

@Injectable()
export class UserPowerService {
  constructor(
    private accountService: AccountService,
    private workoutService: ScheduledWorkoutService,
    private workoutFeedbackService: WorkoutFeedbackService,
  ) {}
  public async getProgrammeInformation(
    relatedProgrammes: Programme[],
    authContext: AuthContext,
  ) {
    // Fetch user
    const account = await this.accountService.findBySub(authContext.sub);

    // Fetch user training_programmes
    const userProgrammes = await UserProgramme.query().where(
      'account_id',
      account.id,
    );

    return await Promise.all(
      relatedProgrammes.map(async (each) => {
        const userProgramme = userProgrammes.find(
          (prog) => prog.trainingProgrammeId === each.id,
        );
        if (!userProgramme) {
          return;
        }
        const weeks = await UserWorkoutWeek.query().where(
          'user_training_programme_id',
          userProgramme.id,
        );

        return {
          id: each.id,
          isActive: userProgramme.id === account.userTrainingProgrammeId,
          latestWeek: weeks.reduce(
            (prev, curr) => (prev < curr.weekNumber ? prev : curr.weekNumber),
            1,
          ),
        };
      }),
    );
  }

  public async continueProgramme(params: {
    accountId: string;
    trainingProgrammeId: string;
  }) {
    return this.setUserProgramme(params);
  }

  /**
   * Switches a user onto a different programme or a different week of the current programme
   *
   * @param params.accountId the user's account id
   * @param params.trainingProgrammeId the id of the training programme being switched to.
   * If not specified the user will retain their current programme.
   * @param params.week The week number the user will be assigned.
   * If not specified this will resume to the highest week number the user has previously reached
   * on the target programme, or week 1 if no user history on the programme.
   *
   * @param opts.forceUpdate optional. If 'true' the user's week will be reset even if the programme and week number match their current programme/week.
   * @param opts.transaction optional. The database transaction to be used for querying.
   *
   * @returns
   */
  public async setUserProgramme(
    params: {
      accountId: string;
      trainingProgrammeId?: string;
      weekNumber?: number;
    },
    opts: {
      forceUpdate?: boolean;
      transaction?: Transaction;
    } = {},
  ) {
    const { accountId } = params;
    let { trainingProgrammeId, weekNumber } = params;

    if (!trainingProgrammeId && !weekNumber) {
      throw new Error(
        'At least one of trainingProgrammeId or week is required',
      );
    }

    const currentProgramme = await this.findCurrentProgrammeInfo(
      accountId,
      opts,
    );

    const isProgrammeChanged =
      params.trainingProgrammeId &&
      params.trainingProgrammeId !== currentProgramme.trainingProgrammeId;

    const isWeekChanged =
      isProgrammeChanged ||
      (params.weekNumber != null &&
        params.weekNumber !== currentProgramme.weekNumber);

    if (!opts.forceUpdate && !(isProgrammeChanged || isWeekChanged)) {
      // Nothing to do
      return true;
    }

    // Ensure new programme exists
    if (isProgrammeChanged) {
      await Programme.query(opts.transaction)
        .select(1)
        .whereNull('deleted_at')
        .findById(trainingProgrammeId)
        .throwIfNotFound({ id: trainingProgrammeId });
    }

    trainingProgrammeId =
      trainingProgrammeId ?? currentProgramme.trainingProgrammeId;
    if (!trainingProgrammeId) {
      throw new Error('Unable to determine training programme id.');
    }

    // If no week was specified, see if we can resume the user's progress on the programme.
    // If not then we can start them on week 1
    let isResumingProgramme = false;
    if (!weekNumber) {
      const week = await findMostRecentWeek(accountId, trainingProgrammeId, {
        transaction: opts.transaction,
      });
      if (week) {
        isResumingProgramme = true;
        weekNumber = week.weekNumber;
      } else {
        weekNumber = 1;
      }
    }

    let trx = opts.transaction;
    if (!trx) {
      trx = await Account.startTransaction();
    }

    try {
      // Assign user to new programme (if required)
      let userTrainingProgrammeId = currentProgramme.userTrainingProgrammeId;
      if (isProgrammeChanged) {
        userTrainingProgrammeId = await this.findOrCreateUserProgramme(
          trx,
          accountId,
          trainingProgrammeId,
        );
        await Account.query(trx)
          .findById(accountId)
          .patch({ userTrainingProgrammeId });
      }

      if (!isResumingProgramme) {
        // If user is not resuming an existing programme we need to populate new programme with workouts.
        const workouts = await this.getProgrammeWorkouts(
          trainingProgrammeId,
          weekNumber,
          { transaction: trx },
        );

        // Populate week with workouts
        if (workouts.length) {
          const now = new Date();
          await UserWorkoutWeek.query(trx).insertGraph({
            userTrainingProgrammeId,
            weekNumber,
            createdAt: now,
            workouts: workouts.map((workout) => ({
              accountId,
              type: WorkoutType.SCHEDULED,
              workoutId: workout.workoutId,
              orderIndex: workout.orderIndex,
            })),
          });
        }
      }

      if (!opts.transaction) {
        await trx.commit();
      }
    } catch (error) {
      console.log('setUserProgramme', 'error', error);
      if (!opts.transaction) {
        await trx.rollback();
      }
      throw error;
    }

    return true;
  }

  private async findCurrentProgrammeInfo(
    accountId: string,
    opts: { transaction?: Transaction } = {},
  ): Promise<UserProgrammeInfo> {
    const db = (opts.transaction as Knex) ?? UserProgramme.knex();
    return db
      .select<UserProgrammeInfo>([
        'account.id as accountId',
        'user_training_programme.training_programme_id as trainingProgrammeId',
        'user_training_programme.id as userTrainingProgrammeId',
        'user_workout_week.week_number as weekNumber',
      ])
      .from('account')
      .leftJoin(
        'user_training_programme',
        'account.user_training_programme_id',
        'user_training_programme.id',
      )
      .joinRaw(
        `left join "user_workout_week" on (
          "user_training_programme"."id" = "user_workout_week"."user_training_programme_id" and 
          "user_workout_week"."completed_at" is null
        )`,
      )
      .where('account.id', accountId)
      .whereNull('user_workout_week.completed_at')
      .orderBy('user_workout_week.created_at', 'desc')
      .first();
  }

  private async getProgrammeWorkouts(
    trainingProgrammeId: string,
    week: number,
    opts: { transaction?: Transaction } = {},
  ) {
    return this.workoutService.findByProgrammeId(
      {
        programmeId: trainingProgrammeId,
        weeks: [week],
      },
      opts,
    );
  }

  public async startProgramme(params: {
    accountId: string;
    trainingProgrammeId: string;
  }) {
    await this.setUserProgramme({
      accountId: params.accountId,
      trainingProgrammeId: params.trainingProgrammeId,
    });

    return true;
  }

  public async restartProgramme(params: {
    accountId: string;
    trainingProgrammeId: string;
  }) {
    await this.setUserProgramme(
      {
        accountId: params.accountId,
        trainingProgrammeId: params.trainingProgrammeId,
        weekNumber: 1,
      },
      { forceUpdate: true },
    );

    return true;
  }

  public async completeWorkoutWeek(accountId: string) {
    const currentWeek = await this.findUsersCurrentWeek(accountId);
    if (!currentWeek) {
      throw new Error('User has no active programme');
    }

    await currentWeek.$fetchGraph('workouts');
    const incompleteWorkouts = currentWeek.workouts.filter(
      (workout) => workout.completedAt === null,
    ).length;
    if (incompleteWorkouts > 0) {
      throw new GraphQLError('Incomplete workouts in week');
    }

    // fetch account
    return Account.transaction(async (transaction) => {
      await this.setUserProgramme(
        { accountId, weekNumber: currentWeek.weekNumber + 1 },
        { transaction },
      );
      await currentWeek.$query(transaction).patch({ completedAt: new Date() });

      return true;
    });
  }

  public async completeWorkout(accountId: string, params: CompleteWorkoutDto) {
    const workout = await UserWorkout.query()
      .findOne({
        id: params.workoutId,
        account_id: accountId,
      })
      .select('id', 'completed_at')
      .throwIfNotFound({ id: params.workoutId });

    if (workout.completedAt !== null) {
      return { success: true };
    }

    try {
      await UserWorkout.transaction(async (trx) => {
        const incrementCompletedWorkouts = Account.query(trx)
          .findById(accountId)
          .increment('workouts_completed', 1);

        const updateWorkout = workout
          .$query(trx)
          .findById(params.workoutId)
          .patch({ completedAt: params.date });

        const weightsUsed = (params.weightsUsed ?? []).map<
          PartialModelObject<UserExerciseHistory>
        >((record) => ({
          accountId,
          exerciseId: record.exerciseId,
          setType: record.setType,
          setNumber: record.setNumber,
          quantity: record.quantity,
          weight: record.weight,
          completedAt: record.completedAt ?? params.date,
        }));
        const updateWeightHistory = await UserExerciseHistory.query(trx).insert(
          weightsUsed,
        );

        await Promise.all([
          incrementCompletedWorkouts,
          updateWorkout,
          updateWeightHistory,
        ]);
      });

      try {
        await this.workoutFeedbackService.saveWorkoutFeedback(
          accountId,
          params,
        );
      } catch (e) {
        console.log('completeWorkout', 'feedback', 'error', e);
      }

      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  public async updateOrder(input: WorkoutOrder[]) {
    try {
      const sql = `CASE id ${input
        .map(() => `WHEN ? THEN ?`)
        .join(' ')} ELSE order_index END`;
      const bindings: (string | number)[] = input.reduce(
        (bindings, workout) => {
          bindings.push(...[workout.id, workout.index]);
          return bindings;
        },
        [],
      );

      await UserWorkout.query()
        .findByIds(input.map((workout) => workout.id))
        .patch({ orderIndex: UserWorkout.knex().raw(sql, bindings) });

      return true;
    } catch (error) {
      console.log('updateOrder.error', error);
      return false;
    }
  }

  public async findCurrentProgramme(accountId: string) {
    const userProgramme = await Account.relatedQuery('trainingProgramme')
      .for(accountId)
      .withGraphFetched('trainingProgramme.localisations')
      .first();

    return userProgramme.trainingProgramme;
  }

  public async findUsersCurrentWeek(
    accountId: string,
    opts: { transaction?: Transaction } = {},
  ): Promise<UserWorkoutWeek> {
    const week = await UserWorkoutWeek.query(opts.transaction)
      .alias('week')
      .joinRelated('userTrainingProgramme')
      .whereNull('week.completed_at')
      .where(
        'week.user_training_programme_id',
        Account.query()
          .findById(accountId)
          .select('user_training_programme_id'),
      )
      .orderBy('week.created_at', 'DESC')
      .limit(1)
      .first();

    return week;
  }

  private async findOrCreateUserProgramme(
    trx: Knex,
    accountId: string,
    trainingProgrammeId: string,
  ) {
    let programme = await UserProgramme.query(trx)
      .where({
        account_id: accountId,
        training_programme_id: trainingProgrammeId,
      })
      .orderBy('created_at', 'desc')
      .limit(1)
      .first();

    if (!programme) {
      programme = await UserProgramme.query(trx)
        .insert({
          id: uuid.v4(),
          trainingProgrammeId,
          accountId,
        })
        .returning('id');
    }

    return programme.id;
  }
}
