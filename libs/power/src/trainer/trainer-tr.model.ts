/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { snakeCaseMappers } from 'objection';

export class TrainerTranslation extends BaseModel {
  static tableName = 'trainer_tr';

  id: string;
  trainerId: string;
  language: string;
  name: string;
}
