/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import type { UserProgramme } from '../user-programme';
import type { UserWorkout } from '../user-workout';

export class UserWorkoutWeek extends BaseModel {
  static tableName = 'user_workout_week';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  userTrainingProgrammeId: string;
  weekNumber: number;
  startedAt?: Date;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  userTrainingProgramme: UserProgramme;
  workouts: UserWorkout[];

  static get relationMappings() {
    const { UserWorkout } = require('../user-workout');
    const { UserProgramme } = require('../user-programme');
    return {
      workouts: {
        relation: Model.HasManyRelation,
        modelClass: UserWorkout,
        join: {
          from: 'user_workout_week.id',
          to: 'user_workout.user_workout_week_id',
        },
      },
      userTrainingProgramme: {
        relation: Model.HasOneRelation,
        modelClass: UserProgramme,
        join: {
          from: 'user_workout_week.user_training_programme_id',
          to: 'user_training_programme.id',
        },
      },
    };
  }
}
