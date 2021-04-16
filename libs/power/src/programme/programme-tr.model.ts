/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';

export class ProgrammeTranslation extends BaseModel {
  static tableName = 'training_programme_tr';

  id: string;
  trainingProgrammeId: string;
  language: string;
  description: string;
}
