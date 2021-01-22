import { Injectable } from '@nestjs/common';
import { Account, AccountService } from '../account';
import { UserProgrammeService } from '../user-programme';
import * as R from 'ramda';
import { Programme } from '../programme';
import { CommonService } from '@lib/common';
import { UserWorkout, UserWorkoutService } from '../user-workout';
import { UserWorkoutWeek, UserWorkoutWeekService } from '../user-workout-week';
import { WorkoutExercise } from '../workout/workout-exercise.model';
import { UserExerciseNote } from '../user-exercise-note/user-exercise-note.model';
import { CompleteWorkout, DownloadQuality, WorkoutOrder } from '../types';
import { ProgrammeWorkout, Workout, WorkoutService } from '../workout';

@Injectable()
export class UserPowerService {
  constructor(
    private accountService: AccountService, // private userProgramme: UserProgrammeService,
    private userWorkoutService: UserWorkoutService,
    private userWorkoutWeekService: UserWorkoutWeekService,
    private commonService: CommonService,
    private workoutService: WorkoutService,
  ) {}

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
      const notCompleteWorkouts = currentWeek.workouts.filter(
        (each) => each.completedAt === null,
      );
      // if notCompleteWorkouts length > 0 then some workouts haven't been completed
      if (notCompleteWorkouts.length > 0) {
        throw new Error('Incomplete workouts in week');
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

      await Promise.all(
        workouts.map(async (workout) => {
          const week = await UserWorkoutWeek.query(trx).insertAndFetch({
            userTrainingProgrammeId: account.userTrainingProgrammeId,
            weekNumber: workout.weekNumber,
          });

          await UserWorkout.query(trx).insert({
            userWorkoutWeekId: week.id,
            workoutId: workout.workoutId,
            orderIndex: workout.orderIndex,
          });
        }),
      );

      return true;
    });
  }

  public async completeWorkout(input: CompleteWorkout, sub: string) {
    // fetch account
    // ensure authenticated to perform the request
    // update workout
    // update feedback
    const account = await this.accountService.findBySub(sub);
    const userWorkout = await this.userWorkoutService.findById(input.workoutId);
    const userWorkoutWeek = await this.userWorkoutWeekService
      .findById(userWorkout.userWorkoutWeekId)
      .withGraphJoined('userTrainingProgramme');

    if (userWorkoutWeek.userTrainingProgramme.accountId !== account.id) {
      throw new Error('Not authorised');
    }

    try {
      return this.userWorkoutService.completeWorkout(input, sub);
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

    console.log(JSON.stringify(account));

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
                .andWhere('exercise_id', exercise.id);

              const exerciseLocalisation = (
                exercise.exercise.localisations ?? []
              ).find((tr) => tr.language === language);
              return {
                ...exercise,
                notes: R.path(['note'], userExercise),
                exercise: {
                  id: exercise.exercise.id,
                  name: R.path(['name'], exerciseLocalisation),
                  coachingTips: R.path(['coachingTips'], exerciseLocalisation),
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

  private returnNextWeek(weeks) {
    return weeks.reduce(
      (a, b) => {
        if (a.weekNumber === 0) {
          return {
            weekNumber: b.weekNumber,
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
        '[workout.[workout.[localisations, exercises.[sets, exercise.[localisations]]]]]',
      );

    const currentWeek = this.returnCurrentWeek(weeks);

    const nextWeek = this.returnNextWeek(weeks);

    console.log(JSON.stringify(currentWeek));
    console.log(JSON.stringify(nextWeek));

    // if the current weekNumber is 0 then there are no current weeks that haven't been completed

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
        workouts: this.buildWeek(currentWeek, language, account),
      },
      nextWeek: nextWeek.weekNumber !== 0 && {
        weekNumber: currentWeek.weekNumber,
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
