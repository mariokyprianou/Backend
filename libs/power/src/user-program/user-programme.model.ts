import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Programme } from '../programme';

export class UserProgramme extends BaseModel {
  static tableName = 'user_training_programme';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  accountId: string;
  trainingProgrammeId: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;

  programme: Programme;

  static relationMappings = () => ({
    programme: {
      relation: Model.HasOneRelation,
      modelClass: Programme,
      join: {
        from: 'user_training_programme.training_programme_id',
        to: 'training_programme.id',
      },
    },
  });
}
