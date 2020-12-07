import { Injectable } from '@nestjs/common';
import {
  CreateHmcQuestionGraphQlInput,
  UpdateHmcQuestionGraphQlInput,
} from 'apps/cms/src/hmc-question/hmc-question.cms.resolve';
import { HmcQuestionScore } from './hmc-question-score.model';
import { HmcQuestionTranslation } from './hmc-question-translation.model';
import { HmcQuestion } from './hmc-question.model';

@Injectable()
export class HmcQuestionService {
  public findAll() {
    return HmcQuestion.query()
      .withGraphFetched('localisations')
      .withGraphFetched('programmeScores');
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  // Note: if hmc_question_score and hmc_question_tr were
  // set to on delete cascade then this could be slightly neater
  public async delete(id: string) {
    const hmcQuestion = await this.findById(id);

    await HmcQuestionTranslation.query().where('hmc_question_id', id).delete();
    await HmcQuestionScore.query().where('hmc_question_id', id).delete();
    await HmcQuestion.query().deleteById(id);

    return hmcQuestion;
  }

  public async update(hmcQuestion: UpdateHmcQuestionGraphQlInput) {
    const hmcQuestionModel = await HmcQuestion.query().upsertGraphAndFetch(
      hmcQuestion,
      {
        relate: true,
      },
    );

    return this.findById(hmcQuestionModel.id);
  }

  public async create(hmcQuestion: CreateHmcQuestionGraphQlInput) {
    const hmcQuestionModel = await HmcQuestion.query().insertGraphAndFetch(
      hmcQuestion,
      {
        relate: true,
      },
    );

    return this.findById(hmcQuestionModel.id);
  }
}
