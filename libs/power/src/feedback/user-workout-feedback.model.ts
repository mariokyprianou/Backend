import { UserModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { User } from '../user';

export class UserWorkoutFeedback extends UserModel {
  static tableName = 'user_workout_feedback';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  userWorkoutId: string;
  emoji: string;
  timeTaken: number;
  feedbackIntensity: number;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;

  account: User;

  static relationMappings = {
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
