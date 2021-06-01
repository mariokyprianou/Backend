import { Injectable } from '@nestjs/common';
import {
  CreateHmcQuestionGraphQlInput,
  UpdateHmcQuestionGraphQlInput,
} from 'apps/cms/src/hmc-question/hmc-question.cms.resolver';
import Objection from 'objection';
import { Programme } from '../programme';
import { ProgrammeEnvironment, PublishStatus } from '../types';
import { HmcQuestionScore } from './hmc-question-score.model';
import { HmcQuestionTranslation } from './hmc-question-translation.model';
import { QuestionnaireAnswer } from './hmc-question.interface';
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
    query.orderBy('order_index', sortOrder ?? 'ASC');

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
    responses: {
      question: string;
      answer: QuestionnaireAnswer;
    }[],
    environment: ProgrammeEnvironment,
  ) {
    const answerMapping = {
      [QuestionnaireAnswer.One]: 'answer1Score',
      [QuestionnaireAnswer.Two]: 'answer2Score',
      [QuestionnaireAnswer.Three]: 'answer3Score',
      [QuestionnaireAnswer.Four]: 'answer4Score',
    };

    const questionScores = await HmcQuestionScore.query()
      .whereIn(
        'hmc_question_id',
        responses.map((answer) => answer.question),
      )
      .joinRelated('trainingProgramme')
      .where('trainingProgramme.environment', environment)
      .where('trainingProgramme.status', PublishStatus.PUBLISHED)
      .whereNull('trainingProgramme.deleted_at');

    const scoresByProgrammeId = responses.reduce<{
      [programmeId: string]: number;
    }>((scoresByProgrammeId, response) => {
      questionScores
        .filter((qs) => qs.hmcQuestionId === response.question)
        .forEach((qs) => {
          const scoreField = answerMapping[response.answer];
          if (!scoresByProgrammeId[qs.trainingProgrammeId]) {
            scoresByProgrammeId[qs.trainingProgrammeId] = 0;
          }

          const score = parseInt(qs[scoreField]);
          scoresByProgrammeId[qs.trainingProgrammeId] += score;
        });

      return scoresByProgrammeId;
    }, {});

    // reduce the keys down to get the key that is the highest value
    let programmeId = Object.keys(scoresByProgrammeId).reduce(
      (currentMaxProgrammeId, programmeId) => {
        return scoresByProgrammeId[currentMaxProgrammeId] >
          scoresByProgrammeId[programmeId]
          ? currentMaxProgrammeId
          : programmeId;
      },
      null,
    );

    // If no match, return a random programme from the matching environment
    if (!programmeId) {
      const programme = await Programme.query()
        .alias('tp')
        .select('tp.id')
        .where('tp.environment', environment)
        .where('tp.status', PublishStatus.PUBLISHED)
        .whereNull('tp.deleted_at')
        .orderByRaw('RANDOM()')
        .limit(1)
        .first();

      programmeId = programme?.id;
    }

    // If _still_ no match, return any random programme
    if (!programmeId) {
      const programme = await Programme.query()
        .alias('tp')
        .select('tp.id')
        .where('tp.status', PublishStatus.PUBLISHED)
        .whereNull('tp.deleted_at')
        .orderByRaw('RANDOM()')
        .limit(1)
        .first();

      programmeId = programme?.id;
    }

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
