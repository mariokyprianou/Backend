/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import { ChallengeType, ChallengeUnitType } from './challenge.interface';
import type { ChallengeTranslation } from './challenge-translation.model';

export class Challenge extends BaseModel {
  static tableName = 'challenge';

  id: string;
  trainingProgrammeId: string;
  type: ChallengeType;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  unitType: ChallengeUnitType;
  imageKey: string;

  localisations: ChallengeTranslation[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static get relationMappings() {
    const { ChallengeTranslation } = require('./challenge-translation.model');
    return {
      localisations: {
        relation: BaseModel.HasManyRelation,
        modelClass: ChallengeTranslation,
        join: {
          from: 'challenge.id',
          to: 'challenge_tr.challenge_id',
        },
      },
    };
  }
}
