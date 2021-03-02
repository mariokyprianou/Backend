import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { DownloadQuality, downloadQuality, WeightPreference } from '../types';
import { UserProgramme } from '../user-programme';

export class Account extends BaseModel {
  static tableName = 'account';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  cognitoUsername: string;
  userTrainingProgrammeId: string;
  downloadQuality: DownloadQuality;
  emails: boolean;
  analytics: boolean;
  errorReports: boolean;
  notifications: boolean;
  createdAt: Date;
  updatedAt: Date;
  weightPreference: WeightPreference;

  trainingProgramme: UserProgramme;

  static relationMappings = {
    trainingProgramme: {
      relation: Model.HasOneRelation,
      modelClass: UserProgramme,
      join: {
        from: 'account.user_training_programme_id',
        to: 'user_training_programme.id',
      },
    },
  };
}
