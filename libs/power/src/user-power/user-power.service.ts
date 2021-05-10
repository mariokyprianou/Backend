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

async function findHighestCompletedWeek(
  accountId: string,
  trainingProgrammeId: string,
  opts: { transaction?: Transaction } = {},
) {
  const completedWeek = await UserWorkoutWeek.query(opts.transaction)
    .joinRelated('userTrainingProgramme', { alias: 'tp' })
    .where('tp.account_id', accountId)
    .where('tp.training_programme_id', trainingProgrammeId)
    .whereNotNull('completed_at')
    .orderBy('completed_at', 'DESC')
    .limit(1)
    .first();

  if (completedWeek) {
    return completedWeek.weekNumber;
  } else {
    return 0;
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
   * If not specified this will default to the highest week number the user has previously reached
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
      trainingProgrammeId &&
      currentProgramme.trainingProgrammeId !== trainingProgrammeId;

    const isWeekChanged =
      isProgrammeChanged ||
      (weekNumber != null && weekNumber !== currentProgramme.weekNumber);

    if (!opts.forceUpdate && !(isProgrammeChanged || isWeekChanged)) {
      // Nothing to do
      return;
    }

    // Ensure new programme exists
    if (isProgrammeChanged) {
      await Programme.query(opts.transaction)
        .select(1)
        .findById(trainingProgrammeId)
        .throwIfNotFound({ id: trainingProgrammeId });
    }

    trainingProgrammeId =
      trainingProgrammeId ?? currentProgramme.trainingProgrammeId;
    if (!trainingProgrammeId) {
      throw new Error('Unable to determine training programme id.');
    }

    // If no week specified, pick the week after the highest week the user has previously completed on the programme
    if (!weekNumber) {
      const highestWeek = await findHighestCompletedWeek(
        accountId,
        trainingProgrammeId,
        { transaction: opts.transaction },
      );
      weekNumber = highestWeek + 1;
    }

    // Get the new current and next week's workout.
    const workouts = await this.getProgrammeWorkouts(
      trainingProgrammeId,
      weekNumber,
      { transaction: opts.transaction },
    );

    let trx = opts.transaction;
    if (!trx) {
      trx = await Account.startTransaction();
    }

    try {
      // Assign user to new programme (if required)
      if (isProgrammeChanged) {
        currentProgramme.userTrainingProgrammeId = await this.createUserProgramme(
          trx,
          accountId,
          trainingProgrammeId,
        );
      }

      // Populate week with workouts (if week exists)
      if (workouts.length) {
        const now = new Date();
        await UserWorkoutWeek.query(trx).insertGraph({
          userTrainingProgrammeId: currentProgramme.userTrainingProgrammeId,
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
      .andWhere('userTrainingProgramme.account_id', accountId)
      .orderBy('week.created_at', 'DESC')
      .limit(1)
      .first();

    return week;
  }

  private async createUserProgramme(
    trx: Knex,
    accountId: string,
    trainingProgrammeId: string,
  ) {
    await trx.raw('SET CONSTRAINTS ALL DEFERRED');
    const userTrainingProgrammeId = uuid.v4();

    await Account.query(trx)
      .findById(accountId)
      .patch({ userTrainingProgrammeId });

    const userProgramme = await UserProgramme.query(trx)
      .insert({
        id: userTrainingProgrammeId,
        trainingProgrammeId,
        accountId,
      })
      .returning('id');

    return userProgramme.id;
  }
}
