/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { snakeCaseMappers } from 'objection';

export class ProgrammeTranslation extends BaseModel {
  static tableName = 'training_programme_tr';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  trainingProgrammeId: string;
  language: string;
  description: string;
}
