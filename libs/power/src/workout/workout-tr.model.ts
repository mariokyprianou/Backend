/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class WorkoutTranslation extends BaseModel {
  static tableName = 'workout_tr';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  workoutId: string;
  language: string;
  name: string;
}
