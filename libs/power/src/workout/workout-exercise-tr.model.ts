import { BaseModel } from '@lib/database';

export class WorkoutExerciseTranslation extends BaseModel {
  static tableName = 'workout_exercise_tr';

  id: string;
  workoutExerciseId: string;
  language: string;
  coachingTips: string;
  createdAt: Date;
  updatedAt: Date;
}
