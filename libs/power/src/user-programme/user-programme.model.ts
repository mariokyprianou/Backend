import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Programme } from '../programme';
import { UserWorkoutWeek } from '../user-workout-week';

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
  // user: User; // TODO: this needs hooking up to the actual user

  static relationMappings = {
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
