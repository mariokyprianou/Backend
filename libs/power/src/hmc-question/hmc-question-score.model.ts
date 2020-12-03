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
  trainingProgramID: string;
  answer1Score: number;
  answer2Score: number;
  answer3Score: number;
  answer4Score: number;
  createdAt: Date;
  updatedAt: Date;

  hmcQuestion: HmcQuestion[];
  trainingProgram: Programme;

  static relationMappings = {
    hmcQuestion: {
      relation: Model.BelongsToOneRelation,
      modelClass: HmcQuestion,
      join: {
        from: 'hmc_question_tr.hmc_question_id',
        to: 'hmc_question.id',
      },
    },
    trainingProgram: {
      relation: Model.BelongsToOneRelation,
      modelClass: Programme,
      join: {
        from: 'hmc_question_tr.training_programme_id',
        to: 'training_programme.id',
      },
    },
  };
}
