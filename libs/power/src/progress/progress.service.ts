/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Thu, 11th February 212021
 * Copyright 2021 - The Distance
 */

import { Injectable } from '@nestjs/common';
import { startOfMonth } from 'date-fns';
import { AccountService } from '../account';
import { AuthContext } from '../types';
import { UserProgramme } from '../user-programme';
import { ProgressMonth, ProgressType } from './progress.interface';

@Injectable()
export class ProgressService {
  constructor(private accountService: AccountService) {}

  public async getProgress(authContext: AuthContext): Promise<ProgressMonth[]> {
    const account = await this.accountService.findBySub(authContext.sub);

    // Fetch all user workout weeks
    // Fetch all user workouts
    // Generate months from data
    // generate type
    const programmes: Partial<UserProgramme>[] = await UserProgramme.query()
      .where('account_id', account.id)
      .withGraphFetched('userWorkoutWeeks.workouts');

    const progressMonths = {};
    programmes.forEach((programme) => {
      programme.userWorkoutWeeks.forEach((week) => {
        week.workouts.forEach((workout) => {
          if (!workout.completedAt) {
            // workout not complete
            return;
          }

          const record = {
            type: ProgressType.WORKOUT_COMPLETE,
            date: workout.completedAt,
          };

          const month = startOfMonth(workout.completedAt);
          if (!progressMonths[month.toISOString()]) {
            progressMonths[month.toISOString()] = [];
          }
          progressMonths[month.toISOString()].push(record);
        });

        if (week.weekNumber === 1) {
          const type = ProgressType.NEW_PROGRAMME;
          const date = week.createdAt;
          const month = startOfMonth(new Date(week.createdAt));
          progressMonths[month.toISOString()] = progressMonths[
            month.toISOString()
          ]
            ? [...progressMonths[month.toISOString()], { type, date }]
            : [{ type, date }];
        } else {
          const type = ProgressType.NEW_WEEK;
          const prevWeek = programme.userWorkoutWeeks.find(
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

    return Object.keys(progressMonths).map((val) => ({
      startOfMonth: new Date(val),
      days: progressMonths[val],
    }));
  }
}
