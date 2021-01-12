import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { UserProgramme } from '../user-programme';
import { UserWorkout } from '../user-workout/user-workout.model';

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
  workout: UserWorkout;

  static relationMappings = {
    userTrainingProgramme: {
      relation: Model.BelongsToOneRelation,
      modelClass: UserProgramme,
      join: {
        from: 'user_workout_week.user_training_programme_id',
        to: 'user_training_programme.id',
      },
    },
    workout: {
      relation: Model.HasOneRelation,
      modelClass: UserWorkout,
      join: {
        from: 'user_workout_week.id',
        to: 'user_workout.user_workout_week_id',
      },
    },
  };
}
