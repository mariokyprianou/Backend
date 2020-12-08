import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Programme } from '../programme';

export class UserWorkoutWeek extends BaseModel {
  static tableName = 'user_workout_week';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  // TODO: should this be user_training_programme_id
  trainingProgrammeId: string;
  weekNumber: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  trainingProgramme: Programme;

  static relationMappings = {
    trainingProgramme: {
      relation: Model.BelongsToOneRelation,
      modelClass: Programme,
      join: {
        from: 'user_workout_week.training_programme_id',
        to: 'training_programme.id',
      },
    },
  };
}
