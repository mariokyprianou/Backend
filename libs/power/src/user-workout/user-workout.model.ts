import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { UserWorkoutWeek } from '../user-workout-week';
import { Workout } from '../workout';
import { UserWorkoutFeedbackEmoji } from './user-workout-feedback-emoji.model';

export class UserWorkout extends BaseModel {
  static tableName = 'user_workout';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  userWorkoutWeekId: string;
  workoutId: string;
  orderIndex: number;
  feedBackIntensity: number;
  timeTaken: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  workout: Workout;
  userWorkoutWeek: UserWorkoutWeek;
  emojis: UserWorkoutFeedbackEmoji[];

  static relationMappings = {
    workout: {
      relation: Model.BelongsToOneRelation,
      modelClass: Workout,
      join: {
        from: 'user_workout.workout_id',
        to: 'workout.id',
      },
    },
    userWorkoutWeek: {
      relation: Model.BelongsToOneRelation,
      modelClass: UserWorkoutWeek,
      join: {
        from: 'user_workout.user_workout_week_id',
        to: 'user_workout_week.id',
      },
    },
    emojis: {
      relation: Model.HasManyRelation,
      modelClass: UserWorkoutFeedbackEmoji,
      join: {
        from: 'user_workout.id',
        to: 'user_workout_feedback_emoji.user_workout_id',
      },
    },
  };
}
