/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class ConfigTranslation extends BaseModel {
  static tableName = 'config_tr';

//   static get columnNameMappers() {
//     return snakeCaseMappers();
//   }

  id: string;
  configId: string;
  language: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
