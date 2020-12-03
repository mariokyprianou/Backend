import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { HmcQuestion } from './hmc-question.model';

export class HmcQuestionTranslation extends BaseModel {
  static tableName = 'hmc_question_tr';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  hmcQuestionId: number;
  language: string;
  question: string;
  answer_1: string;
  answer_2: string;
  answer_3: string;
  answer_4: string;
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
