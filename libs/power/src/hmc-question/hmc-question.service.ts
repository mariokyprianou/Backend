import { Injectable } from '@nestjs/common';
import { HmcQuestionGraphQlInput } from 'apps/cms/src/hmc-question/hmc-question.cms.resolve';
import { HmcQuestion } from './hmc-question.model';

@Injectable()
export class HmcQuestionService {
  public findAll() {
    return HmcQuestion.query()
      .withGraphFetched('translations')
      .withGraphFetched('scores');
  }

  // public count() {
  //   return ExerciseCategory.query().count();
  // }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  // public async delete(id: string) {
  //   // delete translations
  //   return ExerciseCategory.query().deleteById(id);
  // }

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
