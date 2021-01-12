/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Exercise } from '../exercise';
import { SetType } from '../types';
import { WorkoutExerciseSet } from './workout-exercise-set.model';

export class WorkoutExercise extends BaseModel {
  static tableName = 'workout_exercise';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  workoutId: string;
  exerciseId: string;
  setType: SetType;
  orderIndex: number;

  sets: WorkoutExerciseSet[];
  exercise: Exercise;

  static relationMappings = {
    sets: {
      relation: Model.HasManyRelation,
      modelClass: WorkoutExerciseSet,
      join: {
        from: 'workout_exercise.id',
        to: 'workout_exercise_set.workout_exercise_id',
      },
    },
    exercise: {
      relation: Model.HasOneRelation,
      modelClass: Exercise,
      join: {
        from: 'workout_exercise.exercise_id',
        to: 'exercise.id'
      }
    }
  };
}
