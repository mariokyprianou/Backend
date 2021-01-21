/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { ExerciseTranslation } from './exercise-tr.model';

export class Exercise extends BaseModel {
  static tableName = 'exercise';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  trainerId: string;
  weight: boolean;
  videoKey: string;
  videoKeyEasy: string;
  videoKeyEasiest: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  localisations: ExerciseTranslation[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static relationMappings = {
    localisations: {
      relation: Model.HasManyRelation,
      modelClass: ExerciseTranslation,
      join: {
        from: 'exercise.id',
        to: 'exercise_tr.exercise_id',
      },
    },
  };
}
