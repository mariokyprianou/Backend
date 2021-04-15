/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import type { Exercise } from '../exercise';
import { SetType } from '../workout';

export class UserExerciseHistory extends BaseModel {
  static tableName = 'user_exercise_history';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  accountId: string;
  exerciseId: string;
  weight: number;
  setType: SetType;
  setNumber: number;
  quantity: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  exercise: Exercise;

  static get relationMappings() {
    const { Exercise } = require('../exercise');
    return {
      exercise: {
        relation: Model.BelongsToOneRelation,
        modelClass: Exercise,
        join: {
          from: 'user_exercise_history.exercise_id',
          to: 'exercise.id',
        },
      },
    };
  }
}
