/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { RelationMappings } from 'objection';

import type { TrainerTranslation } from './trainer-tr.model';
import type { Exercise } from '../exercise';
import type { Programme } from '../programme';

export class Trainer extends BaseModel {
  static tableName = 'trainer';

  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  // Relations
  localisations?: TrainerTranslation[];
  programmes?: Programme[];
  exercises?: Exercise[];

  public getTranslation(language: string, fallbackLanguage: string = null) {
    if (!this.localisations) {
      return null;
    }

    let translation: TrainerTranslation = null;

    translation = this.localisations.find((tr) => tr.language === language);

    if (!translation && fallbackLanguage) {
      translation = this.localisations.find(
        (tr) => tr.language === fallbackLanguage,
      );
    }

    return translation ?? null;
  }

  static get relationMappings(): RelationMappings {
    const { Programme } = require('../programme');
    const { TrainerTranslation } = require('./trainer-tr.model');
    const { Exercise } = require('../exercise');
    return {
      localisations: {
        relation: BaseModel.HasManyRelation,
        modelClass: TrainerTranslation,
        join: {
          from: 'trainer.id',
          to: 'trainer_tr.trainer_id',
        },
      },
      programmes: {
        relation: BaseModel.HasManyRelation,
        modelClass: Programme,
        join: {
          from: 'trainer.id',
          to: 'training_programme.trainer_id',
        },
      },
      exercises: {
        relation: BaseModel.HasManyRelation,
        modelClass: Exercise,
        join: {
          from: 'trainer.id',
          to: 'exercise.trainer_id',
        },
      },
    };
  }
}
