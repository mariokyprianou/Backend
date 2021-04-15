/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import type { Workout } from '../workout';
import type { Programme } from '../programme';

export class ScheduledWorkout extends BaseModel {
  static tableName = 'training_programme_workout';

  id: string;
  trainingProgrammeId: string;
  weekNumber: number;
  orderIndex: number;
  workoutId: string;

  workout: Workout;
  programme: Programme;

  static get relationMappings() {
    const { Workout } = require('../workout');
    const { Programme } = require('../programme');
    return {
      workout: {
        relation: BaseModel.HasOneRelation,
        modelClass: Workout,
        join: {
          to: 'training_programme_workout.workout_id',
          from: 'workout.id',
        },
      },
      programme: {
        relation: BaseModel.HasOneRelation,
        modelClass: Programme,
        join: {
          from: 'training_programme_workout.training_programme_id',
          to: 'training_programme.id',
        },
      },
    };
  }
}
