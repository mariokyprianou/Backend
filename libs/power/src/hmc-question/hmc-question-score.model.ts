import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Programme } from '../programme/programme.model';
import { HmcQuestion } from './hmc-question.model';

export class HmcQuestionScore extends BaseModel {
  static tableName = 'hmc_question_score';

  static get columnNameMappers() {
    return snakeCaseMappers({ underscoreBeforeDigits: true });
  }

  id: string;
  hmcQuestionId: string;
  trainingProgrammeId: string;
  answer1Score: number;
  answer2Score: number;
  answer3Score: number;
  answer4Score: number;
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
