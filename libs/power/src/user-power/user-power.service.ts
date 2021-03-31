import { Injectable } from '@nestjs/common';
import { Account, AccountService } from '../account';
import { UserProgramme } from '../user-programme';
import * as R from 'ramda';
import { Programme } from '../programme';
import { CommonService } from '@lib/common';
import { UserWorkout, UserWorkoutService } from '../user-workout';
import { UserWorkoutWeek, UserWorkoutWeekService } from '../user-workout-week';
import { WorkoutExercise } from '../workout/workout-exercise.model';
import { UserExerciseNote } from '../user-exercise-note/user-exercise-note.model';
import {
  AuthContext,
  CompleteWorkoutInput,
  DownloadQuality,
  ProgrammeEnvironment,
  WorkoutOrder,
} from '../types';
import { ProgrammeWorkout, WorkoutService } from '../workout';
import { GraphQLError } from 'graphql';
import { v4 as uuid } from 'uuid';
import { subDays } from 'date-fns';
import { UserWorkoutFeedback } from '../feedback';
import { PartialModelObject } from 'objection';
import { UserExerciseHistory } from '../user-exercise-history/user-exercise-history.model';

@Injectable()
export class UserPowerService {
  constructor(
    private accountService: AccountService, // private userProgramme: UserProgrammeService,
    private userWorkoutService: UserWorkoutService,
    private userWorkoutWeekService: UserWorkoutWeekService,
    private commonService: CommonService,
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

  public async startProgramme(programmeId: string, authContext: AuthContext) {
    const account = await this.accountService.findBySub(authContext.sub);
    const workouts = await this.workoutService.findByProgramme({
      programmeId,
      weeks: [1, 2],
    });

    await Account.transaction(async (trx) => {
      const userTrainingProgrammeId = uuid();

      await trx.raw('SET CONSTRAINTS ALL DEFERRED');
      // Create the account
      await Account.query(trx).patchAndFetchById(account.id, {
        userTrainingProgrammeId,
      });
      await UserProgramme.query(trx).insert({
        id: userTrainingProgrammeId,
        trainingProgrammeId: programmeId,
        accountId: account.id,
      });

      // add the workouts to the relevant tables
      const workoutWeeks = workouts.map((workout) => {
        const weekId = uuid();
        return {
          id: weekId,
          userTrainingProgrammeId,
          weekNumber: workout.weekNumber,
          workout: {
            userWorkoutWeekId: weekId,
            workoutId: workout.workoutId,
            orderIndex: workout.orderIndex,
          },
        };
      });
      return UserWorkoutWeek.query(trx).insertGraph(workoutWeeks);
    });

    return true;
  }

  public async restartProgramme(programmeId: string, authContext: AuthContext) {
    // fetch account
    // clean up workout existing workout data
    // start programme
    const workouts = await this.workoutService.findByProgramme({
      programmeId,
      weeks: [1, 2],
    });

    try {
      // delete user workout
      // if the user is restarting an active workout we need to handle that
      const account = await this.accountService.findBySub(authContext.sub);
      await Account.transaction(async (trx) => {
        await trx.raw('SET CONSTRAINTS ALL DEFERRED');
        const userTrainingProgrammeId = uuid();

        // update the account first as to not interfere with any deletes
        await Account.query(trx).patchAndFetchById(account.id, {
          userTrainingProgrammeId,
        });

        // should cascade
        await UserProgramme.query(trx)
          .delete()
          .where('training_programme_id', programmeId)
          .andWhere('account_id', account.id);

        //
        await UserProgramme.query(trx).insert({
          id: userTrainingProgrammeId,
          trainingProgrammeId: programmeId,
          accountId: account.id,
        });

        // add the workouts to the relevant tables
        const workoutWeeks = workouts.map((workout) => {
          const weekId = uuid();
          return {
            id: weekId,
            userTrainingProgrammeId,
            weekNumber: workout.weekNumber,
            workout: {
              userWorkoutWeekId: weekId,
              workoutId: workout.workoutId,
              orderIndex: workout.orderIndex,
            },
          };
        });
        return UserWorkoutWeek.query(trx).insertGraph(workoutWeeks);
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async completeWorkoutWeek(sub: string) {
    // ensure authenticated request
    // check all workouts have been completed
    // fetch the next weeks workout data
    // add the next weeks workout data
    // TODO check the deletion of programme requirement
    // what should happen to a week when the programme has been deleted

    // fetch account
    return Account.transaction(async (trx) => {
      const account = await Account.query(trx)
        .findOne('cognito_username', sub)
        .withGraphJoined('trainingProgramme');
      // Fetch the current workout week
      const weeks = await UserWorkoutWeek.query(trx)
        .whereNull('user_workout_week.completed_at')
        .andWhere(
          'user_workout_week.user_training_programme_id',
          account.userTrainingProgrammeId,
        )
        .withGraphJoined('[workout]');

      const currentWeek = this.returnCurrentWeek(weeks);
      // Check if 7 days have passed since start of week
      if (currentWeek.weekNumber === 1) {
        if (currentWeek.createdAt > subDays(new Date(), 7)) {
          throw new GraphQLError('7 days must pass before completing week');
        }
      } else {
        const previousWeek = await UserWorkoutWeek.query()
          .where('week_number', currentWeek.weekNumber - 1)
          .andWhere(
            'user_training_programme_id',
            account.userTrainingProgrammeId,
          )
          .first();
        if (!previousWeek.completedAt) {
          throw new GraphQLError('An error occurred');
        }
        if (previousWeek.completedAt > subDays(new Date(), 7)) {
          throw new GraphQLError('7 days must pass before completing week');
        }
      }

      const notCompleteWorkouts = currentWeek.workouts.filter(
        (each) => each.completedAt === null,
      );
      // if notCompleteWorkouts length > 0 then some workouts haven't been completed
      if (notCompleteWorkouts.length > 0) {
        throw new GraphQLError('Incomplete workouts in week');
      }

      // if not we can update the current week to be completed at
      const idsToUpdate = weeks
        .filter((each) => each.weekNumber === currentWeek.weekNumber)
        .map((each) => each.id);

      await UserWorkoutWeek.query(trx)
        .patch({ completedAt: new Date() })
        .whereIn('id', idsToUpdate);

      // Week has now been completed. Need to add the next weeks worth of data (this should be current Week number plus 2)
      // First fetch the data.
      const workouts = await ProgrammeWorkout.query(trx)
        .where(
          'training_programme_workout.training_programme_id',
          account.trainingProgramme.trainingProgrammeId,
        )
        .withGraphJoined('workout.[localisations, exercises.[sets]]')
        .where('week_number', currentWeek.weekNumber + 2);

      if (workouts.length === 0) {
        // case of no weeks left on programme
        return true;
      }

      const workoutWeeks = workouts.map((workout) => {
        const weekId = uuid();
        return {
          id: weekId,
          userTrainingProgrammeId: account.userTrainingProgrammeId,
          weekNumber: workout.weekNumber,
          workout: {
            userWorkoutWeekId: weekId,
            workoutId: workout.workoutId,
            orderIndex: workout.orderIndex,
          },
        };
      });
      await UserWorkoutWeek.query(trx).insertGraph(workoutWeeks);

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

  public async currentUserProgramme(sub: string, language: string) {
    // Fetch Account
    // Fetch Programme On Account
    // Fetch the mapped training programme
    const account = await this.accountService
      .findBySub(sub)
      .withGraphJoined(
        '[trainingProgramme.[trainingProgramme.[localisations, images, trainer.[localisations], shareMediaImages]]]',
        {
          minimize: true,
          joinOperation: 'leftJoin',
        },
      );

    // return userProgramme
    return this.buildUserProgramme(account, language);
  }

  private async buildWeek(week, language: string, account: Account) {
    // HIGH OR LOW
    const downloadQuality = account.downloadQuality;
    const generateKey = (key: string) =>
      downloadQuality === DownloadQuality.HIGH
        ? `${key}_1080.mp4`
        : `${key}_480.mp4`;
    return Promise.all(
      week.workouts.map(async (workout: UserWorkout) => {
        const workoutLocalisation = (workout.workout.localisations ?? []).find(
          (tr) => tr.language === language,
        );
        return {
          id: workout.id,
          orderIndex: workout.orderIndex,
          completedAt: workout.completedAt,
          overviewImage:
            workout.workout.overviewImageKey &&
            (await this.commonService.getPresignedUrl(
              workout.workout.overviewImageKey,
              this.commonService.env().FILES_BUCKET,
            )), // todo get the url
          intensity: workout.workout.intensity,
          duration: workout.workout.duration,
          name: R.path(['name'], workoutLocalisation),
          exercises: await Promise.all(
            workout.workout.exercises.map(async (exercise: WorkoutExercise) => {
              const userExercise = await UserExerciseNote.query()
                .findOne('account_id', account.id)
                .andWhere('exercise_id', exercise.exercise.id);

              const coachingTipsLoc = exercise.getTranslation(language);

              const exerciseLocalisation = (
                exercise.exercise.localisations ?? []
              ).find((tr) => tr.language === language);
              return {
                ...exercise,
                notes: R.path(['note'], userExercise),
                exercise: {
                  id: exercise.exercise.id,
                  name: R.path(['name'], exerciseLocalisation),
                  coachingTips: coachingTipsLoc
                    ? coachingTipsLoc.coachingTips
                    : exerciseLocalisation.coachingTips,
                  weight: exercise.exercise.weight,
                  video:
                    exercise.exercise.videoKey &&
                    (await this.commonService.getPresignedUrl(
                      generateKey(exercise.exercise.videoKey),
                      this.commonService.env().VIDEO_BUCKET_DESTINATION,
                      'getObject',
                      'us-east-1',
                      15,
                    )),
                  videoEasy:
                    exercise.exercise.videoKeyEasy &&
                    (await this.commonService.getPresignedUrl(
                      generateKey(exercise.exercise.videoKeyEasy),
                      this.commonService.env().VIDEO_BUCKET_DESTINATION,
                      'getObject',
                      'us-east-1',
                      15,
                    )),
                  videoEasiest:
                    exercise.exercise.videoKeyEasiest &&
                    (await this.commonService.getPresignedUrl(
                      generateKey(exercise.exercise.videoKeyEasiest),
                      this.commonService.env().VIDEO_BUCKET_DESTINATION,
                      'getObject',
                      'us-east-1',
                      15,
                    )),
                },
              };
            }),
          ),
        };
      }),
    );
  }

  private returnCurrentWeek(weeks) {
    return weeks.reduce(
      (a, b) => {
        if (a.weekNumber === 0) {
          return {
            weekNumber: b.weekNumber,
            createdAt: b.createdAt,
            workouts: [b.workout],
          };
        }
        if (a.weekNumber === b.weekNumber) {
          return {
            ...a,
            workouts: [...a.workouts, b.workout],
          };
        }
        if (a.weekNumber > b.weekNumber) {
          return {
            weekNumber: b.weekNumber,
            createdAt: b.createdAt,
            workouts: [b.workout],
          };
        }
        return a;
      },
      {
        weekNumber: 0,
        createdAt: new Date(),
        workouts: [],
      },
    );
  }

  private returnNextWeek(weeks) {
    return weeks.reduce(
      (a, b) => {
        if (a.weekNumber === 0) {
          return {
            weekNumber: b.weekNumber,
            createdAt: b.createdAt,
            workouts: [b.workout],
          };
        }
        if (a.weekNumber === b.weekNumber) {
          return {
            ...a,
            workouts: [...a.workouts, b.workout],
          };
        }
        if (a.weekNumber < b.weekNumber) {
          return {
            weekNumber: b.weekNumber,
            createdAt: b.createdAt,
            workouts: [b.workout],
          };
        }
        return a;
      },
      {
        weekNumber: 0,
        workouts: [],
      },
    );
  }

  private async buildUserProgramme(account: Account, language: string) {
    const originalProgramme: Programme = R.path(
      ['trainingProgramme', 'trainingProgramme'],
      account,
    );

    if (!originalProgramme) {
      throw new Error('No training programme found.');
    }

    // find the current week
    // completed_at null (lowest week number)
    const weeks = await this.userWorkoutWeekService
      .query()
      .whereNull('user_workout_week.completed_at')
      .andWhere(
        'user_workout_week.user_training_programme_id',
        account.userTrainingProgrammeId,
      )
      .withGraphJoined(
        '[workout.[workout.[localisations, exercises.[sets, localisations, exercise.[localisations]]]]]',
      );

    const currentWeek = this.returnCurrentWeek(weeks);

    const nextWeek = this.returnNextWeek(weeks);

    // if the current weekNumber is 0 then there are no current weeks that haven't been completed

    let startedAt: Date;
    if (currentWeek.weekNumber === 1) {
      startedAt = currentWeek.createdAt;
    } else {
      const prevWeek = await UserWorkoutWeek.query()
        .where('week_number', currentWeek.weekNumber - 1)
        .andWhere('user_training_programme_id', account.userTrainingProgrammeId)
        .first();

      if (!prevWeek.completedAt) {
        throw new GraphQLError('An error occurred');
      }
      startedAt = prevWeek.completedAt;
    }

    return {
      id: account.userTrainingProgrammeId,
      trainer: originalProgramme.trainer,
      environment: originalProgramme.environment,
      fatLoss: originalProgramme.fatLoss,
      fitness: originalProgramme.fitness,
      muscle: originalProgramme.muscle,
      description: (originalProgramme.localisations ?? []).find(
        (tr) => tr.language === language,
      ).description,
      currentWeek: currentWeek.weekNumber !== 0 && {
        weekNumber: currentWeek.weekNumber,
        startedAt,
        workouts: this.buildWeek(currentWeek, language, account),
      },
      nextWeek: nextWeek.weekNumber !== 0 && {
        weekNumber: nextWeek.weekNumber,
        startedAt: null,
        workouts: this.buildWeek(nextWeek, language, account),
      },
      programmeImage:
        originalProgramme.images[0] &&
        (await this.commonService.getPresignedUrl(
          originalProgramme.images[0].imageKey,
          this.commonService.env().FILES_BUCKET,
        )),
    };
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
