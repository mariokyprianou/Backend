import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { UserProgramme } from '../user-program';

export class Account extends BaseModel {
  static tableName = 'account';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  cognitoUsername: string;
  trainingProgramId: string;
  createdAt: Date;
  updatedAt: Date;

  trainingProgram: UserProgramme[];

  static relationMappings = () => ({
    localisations: {
      relation: Model.HasOneRelation,
      modelClass: UserProgramme,
      join: {
        from: 'account.training_programme_id',
        to: 'training_programme.id',
      },
    },
  });
}
