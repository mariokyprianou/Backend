/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import type { Programme } from '../programme';
import type { UserWorkoutWeek } from '../user-workout-week';

export class UserProgramme extends BaseModel {
  static tableName = 'user_training_programme';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  trainingProgrammeId: string;
  accountId: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;

  trainingProgramme: Programme;
  userWorkoutWeeks: UserWorkoutWeek[];

  static get relationMappings() {
    const { Programme } = require('../programme');
    const { UserWorkoutWeek } = require('../user-workout-week');
    return {
      trainingProgramme: {
        relation: Model.BelongsToOneRelation,
        modelClass: Programme,
        join: {
          from: 'user_training_programme.training_programme_id',
          to: 'training_programme.id',
        },
      },
      userWorkoutWeeks: {
        relation: Model.HasManyRelation,
        modelClass: UserWorkoutWeek,
        join: {
          from: 'user_training_programme.id',
          to: 'user_workout_week.user_training_programme_id',
        },
      },
    };
  }
}
