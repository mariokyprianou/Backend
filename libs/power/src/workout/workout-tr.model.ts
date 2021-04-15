/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';

export class WorkoutTranslation extends BaseModel {
  static tableName = 'workout_tr';

  id: string;
  workoutId: string;
  language: string;
  name: string;
}
