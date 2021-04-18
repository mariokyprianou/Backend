/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import type { UserWorkoutWeek } from '../user-workout-week';
import type { Workout, WorkoutType } from '../workout';

export class UserWorkout extends BaseModel {
  static tableName = 'user_workout';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  accountId: string;
  userWorkoutWeekId: string;
  type: WorkoutType;
  workoutId: string;
  orderIndex: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  workout: Workout;
  userWorkoutWeek: UserWorkoutWeek;

  static get relationMappings() {
    const { Workout } = require('../workout');
    const { UserWorkoutWeek } = require('../user-workout-week');
    return {
      workout: {
        relation: Model.HasOneRelation,
        modelClass: Workout,
        join: {
          from: 'user_workout.workout_id',
          to: 'workout.id',
        },
      },
      userWorkoutWeek: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserWorkoutWeek,
        join: {
          from: 'user_workout.user_workout_week_id',
          to: 'user_workout_week.id',
        },
      },
    };
  }
}
