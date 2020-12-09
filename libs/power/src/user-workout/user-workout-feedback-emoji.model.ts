import { BaseModel } from '@lib/database';
import { snakeCaseMappers } from 'objection';

export class UserWorkoutFeedbackEmoji extends BaseModel {
  static tableName = 'user_workout_feedback_emoji';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  userWorkoutId: string;
  emoji: string;
}
