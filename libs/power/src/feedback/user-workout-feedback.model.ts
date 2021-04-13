/* eslint-disable @typescript-eslint/no-var-requires */
import { UserModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { ProgrammeEnvironment } from '../types';
import type { User } from '../user';

export class UserWorkoutFeedback extends UserModel {
  static tableName = 'user_workout_feedback';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  userWorkoutId: string;
  emoji: string;
  environment: ProgrammeEnvironment;
  timeTaken: number;
  feedbackIntensity: number;
  accountId: string;
  trainerId: string;
  trainerName: string;
  workoutId: string;
  workoutName: string;
  workoutWeekNumber: number;

  createdAt: Date;
  updatedAt: Date;

  account: User;

  static get relationMappings() {
    const { User } = require('../user');
    return {
      account: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'user_workout_feedback.account_id',
          to: 'account.id',
        },
      },
    };
  }
}
