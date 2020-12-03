import { Injectable } from '@nestjs/common';
import { HmcQuestionGraphQlInput } from 'apps/cms/src/hmc-question/hmc-question.cms.resolve';
import { HmcQuestionScore } from './hmc-question-score.model';
import { HmcQuestionTranslation } from './hmc-question-translation.model';
import { HmcQuestion } from './hmc-question.model';

@Injectable()
export class HmcQuestionService {
  public findAll() {
    return HmcQuestion.query()
      .withGraphFetched('translations')
      .withGraphFetched('scores');
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

  // public async update(id: string, name: string) {
  //   return ExerciseCategory.query().updateAndFetchById(id, {
  //     name,
  //   });
  // }

  public async create(hmcQuestion: HmcQuestionGraphQlInput) {
    const hmcQuestionModel = await HmcQuestion.query().insertGraphAndFetch(
      {
        orderIndex: hmcQuestion.orderIndex,
        translations: hmcQuestion.localisations.map((localisation) => {
          return {
            language: localisation.language,
            question: localisation.question,
            answer_1: localisation.answer1,
            answer_2: localisation.answer2,
            answer_3: localisation.answer3,
            answer_4: localisation.answer4,
          };
        }),
        scores: hmcQuestion.programmeScores.map((score) => {
          return {
            trainingProgrammeId: score.programmeId,
            answer_1_score: score.answer1,
            answer_2_score: score.answer2,
            answer_3_score: score.answer3,
            answer_4_score: score.answer4,
          };
        }),
      },
      {
        relate: true,
      },
    );

    return this.findById(hmcQuestionModel.id);
  }
}
