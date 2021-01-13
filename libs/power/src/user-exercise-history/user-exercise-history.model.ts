import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Exercise } from '../exercise';

export class UserExerciseHistory extends BaseModel {
  static tableName = 'user_exercise_history';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  accountId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  setNumber: number;
  createdAt: Date;
  updatedAt: Date;

  exercise: Exercise;

  static relationMappings = () => ({
    exercise: {
      relation: Model.BelongsToOneRelation,
      modelClass: Exercise,
      join: {
        from: 'user_exercise_history.exercise_id',
        to: 'exercise.id',
      },
    },
  });
}
