import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Challenge } from './challenge.model';

export class ChallengeTranslation extends BaseModel {
  static tableName = 'challenge_tr';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  challengeId: string;
  language: string;
  name: string;
  fieldTitle: string;
  fieldDescription: string;
  createdAt: Date;
  updatedAt: Date;

  challenge: Challenge;

  static relationMappings = {
    challenge: {
      relation: Model.BelongsToOneRelation,
      modelClass: Challenge,
      join: {
        from: 'challenge_tr.challenge_id',
        to: 'challenge.id',
      },
    },
  };
}
