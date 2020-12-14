/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Programme } from '../programme';
import { IntensityEnum } from '../types';
import { WorkoutExercise } from './workout-exercise.model';
import { WorkoutTranslation } from './workout-tr.model';

export class Workout extends BaseModel {
  static tableName = 'workout';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  trainingProgrammeId: string;
  overviewImageKey: string;
  intensity: IntensityEnum;
  duration: number;
  createdAt: Date;
  updatedAt: Date;

  localisations: WorkoutTranslation[];
  exercises: WorkoutExercise[];
  trainingProgramme: Programme;

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static relationMappings = {
    localisations: {
      relation: Model.HasManyRelation,
      modelClass: WorkoutTranslation,
      join: {
        from: 'workout.id',
        to: 'workout_tr.workout_id',
      },
    },
    exercises: {
      relation: Model.HasManyRelation,
      modelClass: WorkoutExercise,
      join: {
        from: 'workout.id',
        to: 'workout_exercise.workout_id',
      },
    },
    trainingProgramme: {
      relation: Model.BelongsToOneRelation,
      modelClass: Programme,
      join: {
        from: 'workout.training_programme_id',
        to: 'training_programme.id',
      },
    },
  };
}
