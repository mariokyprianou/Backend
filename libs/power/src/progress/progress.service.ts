/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Thu, 11th February 212021
 * Copyright 2021 - The Distance
 */

import { Injectable } from '@nestjs/common';
import { startOfMonth } from 'date-fns';
import { UserProgramme } from '../user-programme';
import { ProgressMonth, ProgressType } from './progress.interface';

@Injectable()
export class ProgressService {
  public async getProgress(accountId: string): Promise<ProgressMonth[]> {
    const programmes: Partial<UserProgramme>[] = await UserProgramme.query()
      .where('account_id', accountId)
      .withGraphFetched('userWorkoutWeeks.workouts');

    const progressMonths: {
      [month: string]: { type: ProgressType; date: Date }[];
    } = {};

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

          const month = startOfMonth(workout.completedAt).toISOString();
          if (!progressMonths[month]) {
            progressMonths[month] = [];
          }
          progressMonths[month].push(record);
        });

        if (week.weekNumber === 1) {
          const record = {
            type:
              week.weekNumber === 1
                ? ProgressType.NEW_PROGRAMME
                : ProgressType.NEW_WEEK,
            date: week.startedAt,
          };

          const month = startOfMonth(week.startedAt).toISOString();
          if (!progressMonths[month]) {
            progressMonths[month] = [];
          }
          progressMonths[month].push(record);
        }
      });
    });

    return Object.entries(progressMonths).map(([month, days]) => ({
      startOfMonth: new Date(month),
      days: days.sort((a, b) => b.date.getTime() - a.date.getTime()),
    }));
  }
}
