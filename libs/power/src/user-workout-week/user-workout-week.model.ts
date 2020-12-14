import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { UserProgramme } from '../user-programme';

export class UserWorkoutWeek extends BaseModel {
  static tableName = 'user_workout_week';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  userTrainingProgrammeId: string;
  weekNumber: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  userTrainingProgramme: UserProgramme;

  static relationMappings = {
    userTrainingProgramme: {
      relation: Model.BelongsToOneRelation,
      modelClass: UserProgramme,
      join: {
        from: 'user_workout_week.user_training_programme_id',
        to: 'user_training_programme.id',
      },
    },
  };
}
