/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Config } from './config.model';

export class ConfigTranslation extends BaseModel {
  static tableName = 'config_tr';

  id: string;
  configId: string;
  language: string;
  title: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;

  config: Config;

  static relationMappings = () => ({
    config: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: Config,
      join: {
        from: 'config_tr.config_id',
        to: 'config.id',
      },
    },
  });
}
