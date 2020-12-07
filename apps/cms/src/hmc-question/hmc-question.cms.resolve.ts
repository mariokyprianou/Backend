import Objection from 'objection';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { HmcQuestion, HmcQuestionService } from '@lib/power/hmc-question';
import { ListMetadata } from '@lib/power/types';

@Resolver('HmcQuestion')
export class HmcQuestionResolver {
  constructor(private readonly service: HmcQuestionService) {}

  @Query('HmcQuestion')
  async HmcQuestion(@Args('id') id): Promise<HmcQuestionGraphQlType> {
    return await this.service.findById(id);
  }

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

    return await findAllQuery;
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
    @Args('input') input: CreateHmcQuestionGraphQlInput,
  ): Promise<HmcQuestionGraphQlType> {
    return await this.service.create(input);
  }

  @Mutation('updateHmcQuestion')
  async updateHmcQuestion(
    @Args('input') input: UpdateHmcQuestionGraphQlInput,
  ): Promise<HmcQuestionGraphQlType> {
    return await this.service.update(input);
  }

  @Mutation('deleteHmcQuestion')
  async deleteHmcQuestion(
    @Args('id') id: string,
  ): Promise<HmcQuestionGraphQlType> {
    return await this.service.delete(id);
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

interface HmcQuestionGraphQlType {
  id: string;
  orderIndex: number;
  localisations: HmcQuestionLocalisationGraphQlType[];
  programmeScores: HmcProgrammeScoreGraphQlType[];
}

// TODO: move to common?
export interface CreateHmcQuestionGraphQlInput {
  orderIndex: number;
  localisations: HmcQuestionLocalisationGraphQlType[];
  programmeScores: HmcProgrammeScoreGraphQlInput[];
}

export interface UpdateHmcQuestionGraphQlInput
  extends CreateHmcQuestionGraphQlInput {
  id: string;
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
  trainingProgrammeId: string;
  answer1Score: number;
  answer2Score: number;
  answer3Score: number;
  answer4Score: number;
}

interface HmcProgrammeScoreGraphQlInput {
  trainingProgrammeId: string;
  answer1Score: number;
  answer2Score: number;
  answer3Score: number;
  answer4Score: number;
}

interface HmcQuestionFilter {
  id?: string;
  ids?: string[];
}
