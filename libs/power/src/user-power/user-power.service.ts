import { Injectable } from '@nestjs/common';
import { Account, AccountService } from '../account';
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
import { ProgrammeWorkout, WorkoutService } from '../workout';
import { GraphQLError } from 'graphql';
import * as uuid from 'uuid';
import { subDays } from 'date-fns';
import { UserWorkoutFeedback } from '../feedback';
import { PartialModelGraph, PartialModelObject } from 'objection';
import { UserExerciseHistory } from '../user-exercise-history/user-exercise-history.model';
import Knex from 'knex';

async function findHighestCompletedWeek(
  accountId: string,
  trainingProgrammeId: string,
) {
  const completedWeek = await UserWorkoutWeek.query()
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
    private accountService: AccountService,
    private userWorkoutService: UserWorkoutService,
    private workoutService: WorkoutService,
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

  public async continueProgramme(programme: string, authContext: AuthContext) {
    // check user programme exists
    const account = await this.accountService.findBySub(authContext.sub);
    const [userProgramme] = await UserProgramme.query()
      .where('training_programme_id', programme)
      .andWhere('account_id', account.id);

    if (!userProgramme) {
      throw new GraphQLError(
        "User hasn't started this programme. To continue a programme, a user must have started the programme.",
      );
    }

    // replace active programme
    try {
      await Account.query().patchAndFetchById(account.id, {
        userTrainingProgrammeId: userProgramme.id,
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async setUserProgramme(params: {
    accountId: string;
    trainingProgrammeId?: string;
    week?: number;
  }) {
    const { accountId } = params;
    let { trainingProgrammeId, week } = params;

    if (!trainingProgrammeId && !week) {
      throw new Error(
        'At least one of trainingProgrammeId and week is required',
      );
    }

    let currentProgramme = await Account.relatedQuery('trainingProgramme')
      .for(accountId)
      .first();

    // Ensure programme exists
    if (trainingProgrammeId) {
      await Programme.query()
        .findById(trainingProgrammeId)
        .throwIfNotFound({ message: 'Training programme does not exist.' });
    }

    trainingProgrammeId =
      trainingProgrammeId ?? currentProgramme.trainingProgrammeId;

    // Ensure week exists
    if (week) {
      await ProgrammeWorkout.query()
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
      );
      week = highestWeek + 1;
    }

    // Get the new current and next week's workout.
    const workoutsByWeek = await this.getProgrammeWorkouts(
      currentProgramme.trainingProgrammeId,
      [week, week + 1],
    );

    await Account.transaction(async (trx) => {
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

      // Populate the user's new workouts (current/next week)
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

      return UserWorkoutWeek.query(trx).insertGraph(workoutWeeks);
    });

    return true;
  }

  async getProgrammeWorkouts(trainingProgrammeId: string, weeks: number[]) {
    const workouts = await this.workoutService.findByProgramme({
      programmeId: trainingProgrammeId,
      weeks,
    });
    const workoutsByWeek = new Map<number, ProgrammeWorkout[]>();
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

    // fetch account
    return Account.transaction(async (trx) => {
      const userProgramme = await Account.relatedQuery('trainingProgramme', trx)
        .for(accountId)
        .withGraphJoined('trainingProgramme')
        .first();

      // Fetch the current workout week
      const currentWeek = await this.findUsersCurrentWeek(accountId);

      // Check if 7 days have passed since start of week
      if (currentWeek.weekNumber === 1) {
        if (currentWeek.createdAt > subDays(new Date(), 7)) {
          throw new GraphQLError('7 days must pass before completing week');
        }
      } else {
        const previousWeek = await UserWorkoutWeek.query()
          .where('week_number', currentWeek.weekNumber - 1)
          .andWhere('user_training_programme_id', userProgramme.id)
          .orderBy('started_at', 'DESC')
          .first();
        if (!previousWeek.completedAt) {
          throw new GraphQLError('An error occurred');
        }
        if (previousWeek.completedAt > subDays(new Date(), 7)) {
          throw new GraphQLError('7 days must pass before completing week');
        }
      }

      const incompleteWorkouts = currentWeek.workouts.filter(
        (workout) => workout.completedAt === null,
      );
      // if notCompleteWorkouts length > 0 then some workouts haven't been completed
      if (incompleteWorkouts.length > 0) {
        throw new GraphQLError('Incomplete workouts in week');
      }

      await currentWeek.$query(trx).patch({ completedAt: new Date() });
      const workout = await this.getProgrammeWorkouts(
        userProgramme.trainingProgrammeId,
        [currentWeek.weekNumber + 2],
      );

      const weeks = Array.from(workout.entries()).map<
        PartialModelGraph<UserWorkoutWeek>
      >(([weekNumber, workouts]) => {
        return {
          id: uuid.v4(),
          userTrainingProgrammeId: userProgramme.id,
          weekNumber,
          workouts: workouts.map((workout) => ({
            workoutId: workout.workoutId,
            orderIndex: workout.orderIndex,
          })),
        };
      });

      await UserWorkoutWeek.query(trx).insertGraph(weeks);

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
      if (!workoutInfo) {
        return false;
      }

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

  public async updateOrder(input: WorkoutOrder[], sub: string) {
    try {
      const proms = input.map(async (value: WorkoutOrder) => {
        return this.userWorkoutService.updateOrder(value);
      });

      await Promise.all(proms);
      return true;
    } catch (error) {
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
  ): Promise<UserWorkoutWeek> {
    const week = await UserWorkoutWeek.query()
      .joinRelated('userTrainingProgramme')
      .whereNull('completed_at')
      .whereNotNull('started_at')
      .andWhere('userTrainingProgramme.account_id', accountId)
      .orderBy('started_at', 'DESC')
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
    const userTrainingProgrammeId = uuid();

    await Account.query(trx).patchAndFetchById(accountId, {
      userTrainingProgrammeId,
    });

    return UserProgramme.query(trx).insertAndFetch({
      id: userTrainingProgrammeId,
      trainingProgrammeId,
      accountId,
    });
  }

  private deleteUnstartedWeeks(trx, accountId: string) {
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
