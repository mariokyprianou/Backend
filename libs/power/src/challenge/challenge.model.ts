import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { ChallengeTranslation } from './challenge-translation.model';

export type ChallengeType = 'COUNTDOWN' | 'STOPWATCH' | 'OTHER';

export class Challenge extends BaseModel {
  static tableName = 'challenge';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  type: ChallengeType;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  trainingProgrammeId: string;

  localisations: ChallengeTranslation[];

  static relationMappings = () => ({
    localisations: {
      relation: Model.HasManyRelation,
      modelClass: ChallengeTranslation,
      join: {
        from: 'challenge.id',
        to: 'challenge_tr.challenge_id',
      },
    },
  });
}
