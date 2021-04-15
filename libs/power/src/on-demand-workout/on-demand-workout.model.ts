/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import type { Workout } from '../workout';

export class OnDemandWorkout extends BaseModel {
  static tableName = 'on_demand_workout';

  id: string;
  workoutId: string;
  createdAt: Date;
  updateAt: Date;

  workout: Workout;

  static get relationMappings() {
    const { Workout } = require('../workout');
    return {
      workout: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Workout,
        join: {
          to: 'on_demand_workout.workout_id',
          from: 'workout.id',
        },
      },
    };
  }
}
