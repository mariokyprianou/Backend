import { Injectable } from '@nestjs/common';
import { startOfMonth } from 'date-fns';
import { UserProgramme } from '../user-programme';
import { UserWorkout } from '../user-workout';
import { ProgressMonth, ProgressType } from './progress.interface';

@Injectable()
export class ProgressService {
  public async getProgress(accountId: string): Promise<ProgressMonth[]> {
    const db = UserProgramme.knex();

    const weekEvents = db
      .select(
        db.raw(
          'CASE WHEN user_workout_week.week_number = 1 THEN ? ELSE ? END as type',
          [ProgressType.NEW_PROGRAMME, ProgressType.NEW_WEEK],
        ),
        'user_workout_week.created_at as ts',
        db.raw('NULL as workout_type'),
      )
      .from('user_training_programme')
      .join(
        'user_workout_week',
        'user_workout_week.user_training_programme_id',
        'user_training_programme.id',
      )
      .where('account_id', accountId);

    const workoutEvents = db
      .select(
        db.raw('? as type', ProgressType.WORKOUT_COMPLETE),
        'user_workout.completed_at as ts',
        db.raw('user_workout.type::text as workout_type'),
      )
      .from('user_workout')
      .where('account_id', accountId)
      .whereNotNull('completed_at');

    const results = await UserWorkout.knex()
      .with('results', weekEvents.unionAll(workoutEvents))
      .select('results.type', 'results.ts', 'results.workout_type')
      .from('results')
      .orderBy('ts', 'DESC');

    const progressMonths: {
      [month: string]: { type: ProgressType; date: Date }[];
    } = {};

    results.forEach((row) => {
      const record = {
        type: row.type,
        date: row.ts,
        workoutType: row.workout_type,
      };

      const month = startOfMonth(record.date).toISOString();
      if (!progressMonths[month]) {
        progressMonths[month] = [];
      }

      progressMonths[month].push(record);
    });

    return Object.entries(progressMonths).map(([month, days]) => ({
      startOfMonth: new Date(month),
      days: days.sort((a, b) => b.date.getTime() - a.date.getTime()),
    }));
  }
}
