import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { HmcQuestion } from './hmc-question.model';

export class HmcQuestionTranslation extends BaseModel {
  static tableName = 'hmc_question_tr';

  static get columnNameMappers() {
    return snakeCaseMappers({ underscoreBeforeDigits: true });
  }

  id: string;
  hmcQuestionId: string;
  language: string;
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  createdAt: Date;
  updatedAt: Date;

  hmcQuestion: HmcQuestion[];

  static relationMappings = {
    hmcQuestion: {
      relation: Model.BelongsToOneRelation,
      modelClass: HmcQuestion,
      join: {
        from: 'hmc_question_tr.hmc_question_id',
        to: 'hmc_question.id',
      },
    },
  };
}
