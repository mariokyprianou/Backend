/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import type { Exercise } from '../exercise';
import type { SetType } from './workout.interface';
import type { WorkoutExerciseSet } from './workout-exercise-set.model';
import type { WorkoutExerciseTranslation } from './workout-exercise-tr.model';

export class WorkoutExercise extends BaseModel {
  static tableName = 'workout_exercise';

  id: string;
  workoutId: string;
  exerciseId: string;
  setType: SetType;
  orderIndex: number;

  sets: WorkoutExerciseSet[];
  exercise: Exercise;
  localisations: WorkoutExerciseTranslation[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static get relationMappings() {
    const { Exercise } = require('../exercise');
    const { WorkoutExerciseSet } = require('./workout-exercise-set.model');
    const {
      WorkoutExerciseTranslation,
    } = require('./workout-exercise-tr.model');
    return {
      sets: {
        relation: BaseModel.HasManyRelation,
        modelClass: WorkoutExerciseSet,
        join: {
          from: 'workout_exercise.id',
          to: 'workout_exercise_set.workout_exercise_id',
        },
      },
      localisations: {
        relation: BaseModel.HasManyRelation,
        modelClass: WorkoutExerciseTranslation,
        join: {
          from: 'workout_exercise.id',
          to: 'workout_exercise_tr.workout_exercise_id',
        },
      },
      exercise: {
        relation: BaseModel.HasOneRelation,
        modelClass: Exercise,
        join: {
          from: 'workout_exercise.exercise_id',
          to: 'exercise.id',
        },
      },
    };
  }
}
