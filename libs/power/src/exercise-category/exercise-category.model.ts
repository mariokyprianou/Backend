/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Exercise } from '../exercise/exercise.model';

export class ExerciseCategory extends BaseModel {
  static tableName = 'exercise_category';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  exercises: Exercise[];

  static relationMappings = {
    exercises: {
      relation: Model.HasManyRelation,
      modelClass: Exercise,
      join: {
        from: 'exercise_category.id',
        to: 'exercise.category_id',
      },
    },
  };
}
