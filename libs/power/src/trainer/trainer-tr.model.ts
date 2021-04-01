/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class TrainerTranslation extends BaseModel {
  static tableName = 'trainer_tr';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  trainerId: string;
  language: string;
  name: string;
}
