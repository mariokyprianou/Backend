/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Workout } from './workout.model';
import { Programme } from '../programme';

export class ProgrammeWorkout extends BaseModel {
  static tableName = 'training_programme_workout';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  trainingProgrammeId: string;
  weekNumber: number;
  orderIndex: number;
  workoutId: string;

  workout: Workout;
  programme: Programme;

  static relationMappings = {
    workout: {
      relation: Model.HasOneRelation,
      modelClass: Workout,
      join: {
        to: 'training_programme_workout.workout_id',
        from: 'workout.id',
      },
    },
    programme: {
      relation: Model.HasOneRelation,
      modelClass: Programme,
      join: {
        from: 'training_programme_workout.training_programme_id',
        to: 'training_programme.id',
      },
    },
  };
}
