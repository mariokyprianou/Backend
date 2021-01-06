import { UserModel } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { UserProgramme } from '../user-programme';
import { WorkoutService } from '../workout';
import { Account } from './account.model';
import { v4 as uuid } from 'uuid';
import { UserWorkoutWeek } from '../user-workout-week';
import { UserWorkout } from '../user-workout';
import { UserPreference } from '../types';

@Injectable()
export class AccountService {
  constructor(private workout: WorkoutService) {}
  public findAll() {
    return Account.query();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public findBySub(sub: string) {
    return this.findAll().findOne('cognito_username', sub);
  }

  public delete(id: string) {
    // Note: leave the user training program un-deleted
    return Account.query().findById(id).delete();
  }

  public async updatePreference(input: UserPreference, sub: string) {
    const account = await this.findBySub(sub);
    return account.$query().patchAndFetch(input);
  }

  public async create(
    programme: string,
    cognitoUsername: string,
    accountId: string,
  ) {
    // Fetch the programmes first two weeks

    // UserProgramme

    // Create the account object
    // cognito_username
    // user_training_programme_id

    // Create the user training programme
    // training_programme_id
    // account_id

    // Create user workouts

    // accountId is the map from the segregated user table

    // Fetch user workouts
    const workouts = await this.workout
      .findAll(programme)
      .whereIn('week_number', [1, 2]);

    await Account.transaction(async (trx) => {
      const userTrainingProgrammeId = uuid();

      await trx.raw('SET CONSTRAINTS ALL DEFERRED');
      // Create the account
      await Account.query(trx).insertGraphAndFetch({
        id: accountId,
        cognitoUsername,
        userTrainingProgrammeId,
        trainingProgramme: {
          id: userTrainingProgrammeId,
          trainingProgrammeId: programme,
          accountId,
        },
      });

      // add the workouts to the relevant tables
      return Promise.all(
        workouts.map(async (workout) => {
          const week = await UserWorkoutWeek.query(trx).insertAndFetch({
            userTrainingProgrammeId,
            weekNumber: workout.weekNumber,
          });

          return UserWorkout.query(trx).insert({
            userWorkoutWeekId: week.id,
            workoutId: workout.workoutId,
            orderIndex: workout.orderIndex,
          });
        }),
      );
    });
  }
}
