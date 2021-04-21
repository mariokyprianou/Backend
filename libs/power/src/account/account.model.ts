/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import { DownloadQuality, WeightPreference } from '../types';
import type { UserProgramme } from '../user-programme';

export class Account extends BaseModel {
  static tableName = 'account';

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
  deletedAt?: Date;
  weightPreference: WeightPreference;

  trainingProgramme: UserProgramme;

  static get relationMappings() {
    const { UserProgramme } = require('../user-programme');
    const { UserWorkoutWeek } = require('../user-workout-week');
    return {
      currentWorkoutWeeks: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserWorkoutWeek,
        join: {
          from: 'account.user_training_programme_id',
          to: 'user_workout_week.user_training_programme_id',
        },
      },
      trainingProgramme: {
        relation: BaseModel.HasOneRelation,
        modelClass: UserProgramme,
        join: {
          from: 'account.user_training_programme_id',
          to: 'user_training_programme.id',
        },
      },
    };
  }
}
