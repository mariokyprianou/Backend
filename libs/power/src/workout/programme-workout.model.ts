/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Workout } from './workout.model';

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

  static relationMappings = {
    workout: {
      relation: Model.HasOneRelation,
      modelClass: Workout,
      join: {
        to: 'training_programme_workout.workout_id',
        from: 'workout.id',
      },
    },
  };
}
