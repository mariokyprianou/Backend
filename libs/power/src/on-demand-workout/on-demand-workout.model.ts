/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import type { Programme } from '../programme';
import type { Workout } from '../workout';

export class OnDemandWorkout extends BaseModel {
  static tableName = 'on_demand_workout';

  id: string;
  trainingProgrammeId: string;
  workoutId: string;
  createdAt: Date;
  updateAt: Date;

  workout: Workout;

  static get relationMappings() {
    const { Programme } = require('../programme');
    const { Workout } = require('../workout');
    return {
      trainingProgramme: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Programme,
        join: {
          from: 'on_demand_workout.training_programme_id',
          to: 'training_programme.id',
        },
      },
      workout: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Workout,
        join: {
          from: 'on_demand_workout.workout_id',
          to: 'workout.id',
        },
      },
    };
  }
}
