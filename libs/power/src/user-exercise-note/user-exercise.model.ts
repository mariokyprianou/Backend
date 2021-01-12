import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class UserExerciseNote extends BaseModel {
  static tableName = 'user_exercise_note';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  accountId: string;
  exerciseId: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}
