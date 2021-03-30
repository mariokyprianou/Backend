import { Injectable } from '@nestjs/common';
import { WorkoutService } from '../workout';
import { Account } from './account.model';
import { v4 as uuid } from 'uuid';
import { UserWorkoutWeek } from '../user-workout-week';
import { UserPreference } from '../types';

@Injectable()
export class AccountService {
  constructor(private workoutService: WorkoutService) {}
  public findAll() {
    return Account.query();
  }

  public findById(id: string) {
    return Account.query().findById(id);
  }

  public findBySub(sub: string) {
    return Account.query().findOne('cognito_username', sub);
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
    programmeId: string,
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
    const workouts = await this.workoutService.findByProgramme({
      programmeId,
      weeks: [1, 2],
    });

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
          trainingProgrammeId: programmeId,
          accountId,
        },
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
      return UserWorkoutWeek.query(trx).insertGraphAndFetch(workoutWeeks);
    });
  }
}
