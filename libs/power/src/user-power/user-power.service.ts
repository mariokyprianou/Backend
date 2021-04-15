import { Injectable } from '@nestjs/common';
import { Account } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { UserProgramme } from '../user-programme';
import { Programme } from '../programme';
import { UserWorkout, UserWorkoutService } from '../user-workout';
import { UserWorkoutWeek } from '../user-workout-week';
import {
  AuthContext,
  CompleteWorkoutInput,
  ProgrammeEnvironment,
  WorkoutOrder,
} from '../types';
import {
  ScheduledWorkout,
  ScheduledWorkoutService,
} from '../scheduled-workout';
import { GraphQLError } from 'graphql';
import * as uuid from 'uuid';
import { UserWorkoutFeedback } from '../feedback';
import { PartialModelGraph, PartialModelObject, Transaction } from 'objection';
import { UserExerciseHistory } from '../user-exercise-history/user-exercise-history.model';
import Knex from 'knex';

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

@Injectable()
export class UserPowerService {
  constructor(
    private userWorkoutService: UserWorkoutService,
    private accountService: AccountService,
    private workoutService: ScheduledWorkoutService,
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
   * @param opts.transaction optional. The database transaction to be used for querying.
   *
   * @returns
   */
  public async setUserProgramme(
    params: {
      accountId: string;
      trainingProgrammeId?: string;
      week?: number;
    },
    opts: { transaction?: Transaction } = {},
  ) {
    const { accountId } = params;
    let { trainingProgrammeId, week } = params;

    if (!trainingProgrammeId && !week) {
      throw new Error(
        'At least one of trainingProgrammeId or week is required',
      );
    }

    let currentProgramme = await Account.relatedQuery(
      'trainingProgramme',
      opts.transaction,
    )
      .for(accountId)
      .first();

    // Ensure programme exists
    if (trainingProgrammeId) {
      await Programme.query(opts.transaction)
        .select(1)
        .findById(trainingProgrammeId)
        .throwIfNotFound({ message: 'Training programme does not exist.' });
    }

    trainingProgrammeId =
      trainingProgrammeId ?? currentProgramme.trainingProgrammeId;
    if (!trainingProgrammeId) {
      throw new Error('Unable to determine training programme id.');
    }

    // Ensure week exists
    if (week) {
      await ScheduledWorkout.query(opts.transaction)
        .findOne({
          training_programme_id: trainingProgrammeId,
          week_number: week,
        })
        .throwIfNotFound({
          trainingProgrammeId,
          week,
          message: 'Training programme has insufficient weeks.',
        });
    }

    // If no week specified, pick the week after the highest week the user has previously completed on the programme
    if (!week) {
      const highestWeek = await findHighestCompletedWeek(
        accountId,
        trainingProgrammeId,
        { transaction: opts.transaction },
      );
      week = highestWeek + 1;
    }

    // Get the new current and next week's workout.
    const workoutsByWeek = await this.getProgrammeWorkouts(
      trainingProgrammeId,
      [week, week + 1],
      { transaction: opts.transaction },
    );

    let trx = opts.transaction;
    if (!trx) {
      trx = await Account.startTransaction();
    }

    try {
      // Remove data for any workout weeks that the user never started
      await this.deleteUnstartedWeeks(trx, accountId);

      // Assign user to new programme (if required)
      if (currentProgramme?.trainingProgrammeId !== trainingProgrammeId) {
        currentProgramme = await this.createUserProgramme(
          trx,
          accountId,
          trainingProgrammeId,
        );
      }

      // Populate the new workouts (current/next week)
      const workoutWeeks = Array.from(workoutsByWeek.entries()).map<
        PartialModelGraph<UserWorkoutWeek>
      >(([weekNumber, workouts]) => {
        const now = new Date();
        return {
          id: uuid.v4(),
          userTrainingProgrammeId: currentProgramme.id,
          weekNumber: weekNumber,
          startedAt: weekNumber === week ? now : null,
          createdAt: now,
          workouts: workouts.map((workout) => ({
            workoutId: workout.workoutId,
            orderIndex: workout.orderIndex,
          })),
        };
      });

      await UserWorkoutWeek.query(trx).insertGraph(workoutWeeks);

      if (!opts.transaction) {
        await trx.commit();
      }
    } catch {
      if (!opts.transaction) {
        await trx.rollback();
      }
    }

    return true;
  }

  async getProgrammeWorkouts(
    trainingProgrammeId: string,
    weeks: number[],
    opts: { transaction?: Transaction } = {},
  ) {
    const workouts = await this.workoutService.findByProgrammeId(
      {
        programmeId: trainingProgrammeId,
        weeks,
      },
      opts,
    );
    const workoutsByWeek = new Map<number, ScheduledWorkout[]>();
    for (const workout of workouts) {
      const workouts = workoutsByWeek.get(workout.weekNumber) ?? [];
      workouts.push(workout);
      workoutsByWeek.set(workout.weekNumber, workouts);
    }
    return workoutsByWeek;
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
    await this.setUserProgramme({
      accountId: params.accountId,
      trainingProgrammeId: params.trainingProgrammeId,
      week: 1,
    });

    return true;
  }

  public async completeWorkoutWeek(accountId: string) {
    // ensure authenticated request
    // check all workouts have been completed
    // fetch the next weeks workout data
    // add the next weeks workout data
    // TODO check the deletion of programme requirement
    // what should happen to a week when the programme has been deleted

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
      await currentWeek.$query(transaction).patch({ completedAt: new Date() });

      await this.setUserProgramme(
        { accountId, week: currentWeek.weekNumber + 1 },
        { transaction },
      );

      return true;
    });
  }

  public async completeWorkout(input: CompleteWorkoutInput, sub: string) {
    const account = await this.accountService.findBySub(sub);

    const workoutInfo = await findWorkoutInfo({
      userWorkoutId: input.workoutId,
      userId: account.id,
    });
    if (!workoutInfo) {
      throw new GraphQLError(`User workout does not exist: ${input.workoutId}`);
    }

    try {
      await UserWorkout.transaction(async (trx) => {
        const updateWorkout = UserWorkout.query(trx)
          .findById(input.workoutId)
          .patch({ completedAt: input.date });

        const weightsUsed = (input.weightsUsed ?? []).map<
          PartialModelObject<UserExerciseHistory>
        >((record) => ({
          accountId: account.id,
          exerciseId: record.exerciseId,
          setType: record.setType,
          setNumber: record.setNumber,
          quantity: record.quantity,
          weight: record.weight,
          completedAt: record.date,
        }));
        const updateWeightHistory = await UserExerciseHistory.query(trx).insert(
          weightsUsed,
        );

        await Promise.all([updateWorkout, updateWeightHistory]);
      });

      await UserWorkoutFeedback.query().insert({
        accountId: account.id,
        environment: workoutInfo.environment,
        userWorkoutId: input.workoutId,
        workoutId: workoutInfo.workoutId,
        workoutName: workoutInfo.workoutName,
        emoji: input.emoji,
        trainerId: workoutInfo.trainerId,
        trainerName: workoutInfo.trainerName,
        workoutWeekNumber: workoutInfo.workoutWeekNumber,
        feedbackIntensity: input.intensity,
        timeTaken: input.timeTaken,
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
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
      .whereNotNull('week.started_at')
      .andWhere('userTrainingProgramme.account_id', accountId)
      .orderBy('week.started_at', 'DESC')
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

    return UserProgramme.query(trx)
      .insert({
        id: userTrainingProgrammeId,
        trainingProgrammeId,
        accountId,
      })
      .returning('*');
  }

  private deleteUnstartedWeeks(trx: Transaction, accountId: string) {
    return UserWorkoutWeek.query(trx)
      .delete()
      .whereIn(
        'user_training_programme_id',
        UserProgramme.query()
          .select('id')
          .where('account_id', accountId)
          .whereNull('started_at'),
      );
  }
}

async function findWorkoutInfo(params: {
  userWorkoutId: string;
  userId: string;
}) {
  type WorkoutInfoRecord = {
    environment: ProgrammeEnvironment;
    trainerId: string;
    trainerName: string;
    workoutId: string;
    workoutName: string;
    workoutWeekNumber: number;
  };

  const db = UserWorkout.knex();
  return db
    .select(
      'training_programme.environment as environment',
      'trainer_tr.trainer_id as trainerId',
      'trainer_tr.name as trainerName',
      'workout_tr.workout_id as workoutId',
      'workout_tr.name as workoutName',
      'user_workout_week.week_number as workoutWeekNumber',
    )
    .from('user_workout')
    .join(
      'user_workout_week',
      'user_workout.user_workout_week_id',
      'user_workout_week.id',
    )
    .join(
      'user_training_programme',
      'user_workout_week.user_training_programme_id',
      'user_training_programme.id',
    )
    .join(
      'training_programme',
      'user_training_programme.training_programme_id',
      'training_programme.id',
    )
    .leftJoin('trainer_tr', function () {
      this.on('training_programme.trainer_id', '=', 'trainer_tr.trainer_id');
      this.on('trainer_tr.language', '=', db.raw('?', ['en']));
    })
    .leftJoin('workout_tr', function () {
      this.on('user_workout.workout_id', '=', 'workout_tr.workout_id');
      this.on('workout_tr.language', '=', db.raw('?', ['en']));
    })
    .where('user_workout.id', params.userWorkoutId)
    .andWhere('user_training_programme.account_id', params.userId)
    .first<WorkoutInfoRecord>();
}
