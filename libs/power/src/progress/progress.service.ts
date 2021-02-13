/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Thu, 11th February 212021
 * Copyright 2021 - The Distance
 */

import { Injectable } from '@nestjs/common';
import { ProgressMonth } from 'apps/app/src/progress/progress.resolver';
import { startOfMonth } from 'date-fns';
import { AccountService } from '../account';
import { AuthContext } from '../types';
import { UserProgramme } from '../user-programme';
import { UserWorkoutWeek } from '../user-workout-week';

@Injectable()
export class ProgressService {
  constructor(private accountService: AccountService) {}
  public async getProgress(authContext: AuthContext): Promise<ProgressMonth[]> {
    const account = await this.accountService.findBySub(authContext.sub);

    // Fetch all user workout weeks
    // Fetch all user workouts
    // Generate months from data
    // generate type
    const userProgrammes = await UserProgramme.query()
      .where('account_id', account.id)
      .withGraphFetched('userWorkoutWeeks.workouts');

    // console.log(JSON.stringify(userProgrammes));

    const progressMonths = {};
    userProgrammes.forEach((prog) => {
      prog.userWorkoutWeeks.forEach((week) => {
        week.workouts.forEach((workout) => {
          if (!workout.completedAt) {
            // workout not complete
            return;
          }
          const type = 'WORKOUT_COMPLETE';
          const date = workout.completedAt;
          const month = startOfMonth(new Date(workout.completedAt));
          progressMonths[month.toISOString()] = progressMonths[
            month.toISOString()
          ]
            ? [...progressMonths[month.toISOString()], { type, date }]
            : [{ type, date }];
        });
        if (week.weekNumber === 1) {
          const type = 'NEW_PROGRAMME';
          const date = week.createdAt;
          const month = startOfMonth(new Date(week.createdAt));
          progressMonths[month.toISOString()] = progressMonths[
            month.toISOString()
          ]
            ? [...progressMonths[month.toISOString()], { type, date }]
            : [{ type, date }];
        } else {
          const type = 'NEW_WEEK';
          const prevWeek = prog.userWorkoutWeeks.find(
            (val) =>
              val.weekNumber === week.weekNumber - 1 &&
              val.userTrainingProgrammeId === week.userTrainingProgrammeId,
          );
          if (!prevWeek.completedAt) {
            // Previous week hasn't been completed so this isn't a new week
            return;
          }
          const date = prevWeek.completedAt;
          const month = startOfMonth(new Date(prevWeek.completedAt));
          progressMonths[month.toISOString()] = progressMonths[
            month.toISOString()
          ]
            ? [...progressMonths[month.toISOString()], { type, date }]
            : [{ type, date }];
        }
      });
    });

    // console.log(JSON.stringify(progressMonths));

    return Object.keys(progressMonths).map((val) => ({
      startOfMonth: new Date(val),
      days: progressMonths[val],
    }));
  }
}
