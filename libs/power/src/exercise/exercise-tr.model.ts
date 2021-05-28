/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';

export class ExerciseTranslation extends BaseModel {
  static tableName = 'exercise_tr';

  id: string;
  exerciseId: string;
  language: string;
  name: string;
  coachingTips?: string;
}
