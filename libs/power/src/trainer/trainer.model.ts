/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { TrainerTranslation } from './trainer-tr.model';

export class Trainer extends BaseModel {
  static tableName = 'trainer';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  createdAt: Date;
  updatedAt: Date;

  localisations: TrainerTranslation[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static relationMappings = {
    localisations: {
      relation: Model.HasManyRelation,
      modelClass: TrainerTranslation,
      join: {
        from: 'trainer.id',
        to: 'trainer_tr.trainer_id',
      },
    },
  };
}
