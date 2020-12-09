import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Challenge } from './challenge.model';

export class ChallengeHistory extends BaseModel {
  static tableName = 'challenge_history';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  accountId: string;
  challengeId: string;
  quantity: string;
  createdAt: Date;
  updatedAt: Date;

  challenge: Challenge;

  static relationMappings = {
    challenge: {
      relation: Model.BelongsToOneRelation,
      modelClass: Challenge,
      join: {
        from: 'challenge_history.challenge_id',
        to: 'challenge.id',
      },
    },
  };
}
