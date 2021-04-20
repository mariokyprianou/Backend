/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model } from 'objection';
import type { ExerciseCategory } from '../exercise-category';
import type { ExerciseTranslation } from './exercise-tr.model';

export class Exercise extends BaseModel {
  static tableName = 'exercise';

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
  category: ExerciseCategory;

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static get relationMappings() {
    const { ExerciseTranslation } = require('./exercise-tr.model');
    const { Trainer } = require('../trainer/trainer.model');
    const { ExerciseCategory } = require('../exercise-category');
    return {
      trainer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Trainer,
        join: {
          from: 'exercise.trainer_id',
          to: 'trainer.id',
        },
      },
      localisations: {
        relation: Model.HasManyRelation,
        modelClass: ExerciseTranslation,
        join: {
          from: 'exercise.id',
          to: 'exercise_tr.exercise_id',
        },
      },
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: ExerciseCategory,
        join: {
          from: 'exercise.category_id',
          to: 'exercise_category.id',
        },
      },
    };
  }
}
