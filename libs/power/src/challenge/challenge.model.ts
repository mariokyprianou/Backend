import { BaseModel } from '@lib/database';
import { ChallengeUnitType } from 'apps/cms/src/challenge/challenge.cms.resolver';
import { Model, snakeCaseMappers } from 'objection';
import { ChallengeType } from '../../../../apps/app/src/challenge/challenge.resolver';
import { ChallengeTranslation } from './challenge-translation.model';

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
  unitType: ChallengeUnitType;
  trainingProgrammeId: string;

  localisations: ChallengeTranslation[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

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
