/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class ExerciseTranslation extends BaseModel {
  static tableName = 'exercise_tr';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  exerciseId: string;
  language: string;
  name: string;
  coachingTips: string;
}
