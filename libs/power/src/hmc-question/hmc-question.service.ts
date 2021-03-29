import { Injectable } from '@nestjs/common';
import {
  CreateHmcQuestionGraphQlInput,
  UpdateHmcQuestionGraphQlInput,
} from 'apps/cms/src/hmc-question/hmc-question.cms.resolve';
import Objection from 'objection';
import { ProgrammeEnvironment } from '../types';
import { HmcQuestionScore } from './hmc-question-score.model';
import { HmcQuestionTranslation } from './hmc-question-translation.model';
import { HmcQuestion } from './hmc-question.model';

@Injectable()
export class HmcQuestionService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'order_index',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: HmcQuestionFilter = {},
  ) {
    const query = HmcQuestion.query().withGraphFetched(
      '[localisations,programmeScores]',
    );

    applyFilter(query, filter);

    query.limit(perPage).offset(perPage * page);
    query.orderBy(sortField, sortOrder);

    return query;
  }

  public async findAllQuestions(language = 'en'): Promise<HmcQuestion[]> {
    return HmcQuestion.query()
      .withGraphFetched('localisations')
      .modifyGraph('localisations', (qb) => qb.where('language', language));
  }

  public findAllMeta(filter: HmcQuestionFilter = {}) {
    return applyFilter(HmcQuestion.query(), filter).resultSize();
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
      { relate: true },
    );

    return this.findById(hmcQuestionModel.id);
  }

  public async create(hmcQuestion: CreateHmcQuestionGraphQlInput) {
    const hmcQuestionModel = await HmcQuestion.query().insertGraphAndFetch(
      hmcQuestion,
      { relate: true },
    );

    return this.findById(hmcQuestionModel.id);
  }

  public async calculateProgrammeScores(
    answers: {
      question: string;
      answer: string;
    }[],
    environment: ProgrammeEnvironment,
  ) {
    const programmeScores = {};
    // map over the answers
    // for each answer find the score for each programme
    await Promise.all(
      answers.map(async (each) => {
        const { question, answer } = each;
        // select all scores
        const questionScores = await HmcQuestionScore.query()
          .where('hmc_question_id', question)
          .withGraphJoined('trainingProgramme')
          .where('trainingProgramme.environment', environment);

        // answer can be ONE, TWO, THREE, or FOUR
        const answers = {
          ONE: 'answer1Score',
          TWO: 'answer2Score',
          THREE: 'answer3Score',
          FOUR: 'answer4Score',
        };

        // This loops over each score and updates the value the programme id in programmeScores
        // It's fairly short hand but is in essence id = id.value + new.value
        questionScores.forEach((score) => {
          programmeScores[score.trainingProgrammeId] = programmeScores[
            score.trainingProgrammeId
          ]
            ? programmeScores[score.trainingProgrammeId] +
              parseInt(score[answers[answer]])
            : 0 + parseInt(score[answers[answer]]);
        });
      }),
    );

    // reduce the keys down to get the key that is the highest value
    const programmeId = Object.keys(programmeScores).reduce(
      (a, b) => (programmeScores[a] > programmeScores[b] ? a : b),
      null,
    );

    return programmeId;
  }
}

const applyFilter = (
  hmcQuestionQuery: Objection.QueryBuilder<HmcQuestion, HmcQuestion[]>,
  filter: HmcQuestionFilter,
): Objection.QueryBuilder<HmcQuestion, HmcQuestion[]> => {
  if (filter.id) {
    hmcQuestionQuery.findByIds([filter.id]);
  }

  if (filter.ids) {
    hmcQuestionQuery.findByIds(filter.ids);
  }

  return hmcQuestionQuery;
};

export interface HmcQuestionFilter {
  id?: string;
  ids?: string[];
}
