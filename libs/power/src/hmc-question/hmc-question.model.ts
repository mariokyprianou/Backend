/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { HmcQuestionScore } from './hmc-question-score.model';
import { HmcQuestionTranslation } from './hmc-question-translation.model';

export class HmcQuestion extends BaseModel {
  static tableName = 'hmc_question';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;

  localisations: HmcQuestionTranslation[];
  programmeScores: HmcQuestionScore[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static relationMappings = () => ({
    localisations: {
      relation: Model.HasManyRelation,
      modelClass: HmcQuestionTranslation,
      join: {
        from: 'hmc_question.id',
        to: 'hmc_question_tr.hmc_question_id',
      },
    },
    programmeScores: {
      relation: Model.HasManyRelation,
      modelClass: HmcQuestionScore,
      join: {
        from: 'hmc_question.id',
        to: 'hmc_question_score.hmc_question_id',
      },
    },
  });
}
