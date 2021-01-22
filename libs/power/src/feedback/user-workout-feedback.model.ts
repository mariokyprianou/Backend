import { UserModel } from '@lib/database';
import { snakeCaseMappers } from 'objection';

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
}
