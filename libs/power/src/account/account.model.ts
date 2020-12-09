import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class Account extends BaseModel {
  static tableName = 'account';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  cognitoUsername: string;
  trainingProgramId: number;
  createdAt: Date;
  updatedAt: Date;

  // trainingProgram: ChallengeTranslation[];

  // static relationMappings = () => ({
  //   localisations: {
  //     relation: Model.HasManyRelation,
  //     modelClass: ChallengeTranslation,
  //     join: {
  //       from: 'challenge.id',
  //       to: 'challenge_tr.challenge_id',
  //     },
  //   },
  // });
}
