/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';

export class WorkoutExerciseSet extends BaseModel {
  static tableName = 'workout_exercise_set';

  id: string;
  workoutExerciseId: string;
  setNumber: number;
  quantity: number;
  restTime: number;
}
