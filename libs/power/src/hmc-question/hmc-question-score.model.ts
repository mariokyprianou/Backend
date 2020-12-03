import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Programme } from '../programme/programme.model';
import { HmcQuestion } from './hmc-question.model';

export class HmcQuestionScore extends BaseModel {
  static tableName = 'hmc_question_score';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  hmcQuestionId: number;
  trainingProgrammeID: string;
  answer_1_score: number;
  answer_2_score: number;
  answer_3_score: number;
  answer_4_score: number;
  createdAt: Date;
  updatedAt: Date;

  hmcQuestion: HmcQuestion[];
  trainingProgramme: Programme;

  static relationMappings = {
    hmcQuestion: {
      relation: Model.BelongsToOneRelation,
      modelClass: HmcQuestion,
      join: {
        from: 'hmc_question_score.hmc_question_id',
        to: 'hmc_question.id',
      },
    },
    trainingProgramme: {
      relation: Model.BelongsToOneRelation,
      modelClass: Programme,
      join: {
        from: 'hmc_question_score.training_programme_id',
        to: 'training_programme.id',
      },
    },
  };
}
