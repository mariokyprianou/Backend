import Objection from 'objection';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  HmcQuestion,
  HmcQuestionScore,
  HmcQuestionService,
  HmcQuestionTranslation,
} from '@lib/power/hmc-question';
import { ListMetadata } from '@lib/power/types';

@Resolver('HmcQuestion')
export class HmcQuestionResolver {
  constructor(private readonly service: HmcQuestionService) {}

  @Query('allHmcQuestions')
  async allHmcQuestions(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'order_index',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: HmcQuestionFilter = {},
  ): Promise<HmcQuestionGraphQlType[]> {
    const findAllQuery = applyFilter(this.service.findAll(), filter);

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return (await findAllQuery).map(hmcQuestionModelToHmcQuestionGraphQL);
  }

  @Query('_allHmcQuestionsMeta')
  async _allHmcQuestionsMeta(
    @Args('filter') filter: HmcQuestionFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await applyFilter(this.service.findAll(), filter).resultSize(),
    };
  }

  @Mutation('createHmcQuestion')
  async createHmcQuestion(
    @Args('input') input: HmcQuestionGraphQlInput,
  ): Promise<HmcQuestionGraphQlType> {
    const hmcQuestion = await this.service.create(input);

    return hmcQuestion
      ? hmcQuestionModelToHmcQuestionGraphQL(hmcQuestion)
      : null;
  }
}

const hmcQuestionTranslationModelToHmcQuestionLocalisationGraphQlType = (
  hmcQuestionTranslationModel: HmcQuestionTranslation,
): HmcQuestionLocalisationGraphQlType => {
  return {
    language: hmcQuestionTranslationModel.language,
    question: hmcQuestionTranslationModel.question,
    answer1: hmcQuestionTranslationModel.answer1,
    answer2: hmcQuestionTranslationModel.answer2,
    answer3: hmcQuestionTranslationModel.answer3,
    answer4: hmcQuestionTranslationModel.answer4,
  };
};

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

const hmcQuestionModelToHmcQuestionGraphQL = (
  hmcQuestionModel: HmcQuestion,
): HmcQuestionGraphQlType => {
  return {
    id: hmcQuestionModel.id,
    orderIndex: hmcQuestionModel.orderIndex,
    localisations: hmcQuestionModel.translations.map(
      hmcQuestionTranslationModelToHmcQuestionLocalisationGraphQlType,
    ),
    programmeScores: hmcQuestionModel.scores.map(
      hmcQuestionScoreModelToHmcProgrammeScoreGraphQlType,
    ),
  };
};

const hmcQuestionScoreModelToHmcProgrammeScoreGraphQlType = (
  hmcQuestionScoreModel: HmcQuestionScore,
): HmcProgrammeScoreGraphQlType => {
  return {
    programId: hmcQuestionScoreModel.trainingProgrammeId,
    answer1: hmcQuestionScoreModel.answer1Score,
    answer2: hmcQuestionScoreModel.answer2Score,
    answer3: hmcQuestionScoreModel.answer3Score,
    answer4: hmcQuestionScoreModel.answer4Score,
  };
};

interface HmcQuestionGraphQlType {
  id: string;
  orderIndex: number;
  localisations: HmcQuestionLocalisationGraphQlType[];
  programmeScores: HmcProgrammeScoreGraphQlType[];
}

// TODO: move to common?
export interface HmcQuestionGraphQlInput {
  orderIndex: number;
  localisations: HmcQuestionLocalisationGraphQlType[];
  programmeScores: HmcProgrammeScoreGraphQlInput[];
}

interface HmcQuestionLocalisationGraphQlType {
  language: string;
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
}

interface HmcProgrammeScoreGraphQlType {
  programId: string;
  answer1: number;
  answer2: number;
  answer3: number;
  answer4: number;
}

interface HmcProgrammeScoreGraphQlInput {
  programmeId: string;
  answer1: number;
  answer2: number;
  answer3: number;
  answer4: number;
}

interface HmcQuestionFilter {
  id?: string;
  ids?: string[];
}
