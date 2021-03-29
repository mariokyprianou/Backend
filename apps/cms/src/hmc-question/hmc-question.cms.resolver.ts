import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { HmcQuestionFilter, HmcQuestionService } from '@lib/power/hmc-question';
import {
  HmcQuestionLocalisationGraphQlType,
  ListMetadata,
} from '@lib/power/types';

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
    const questions = await this.service.findAll(
      page,
      perPage,
      sortField,
      sortOrder,
      filter,
    );

    return questions;
  }

  @Query('_allHmcQuestionsMeta')
  async _allHmcQuestionsMeta(
    @Args('filter') filter: HmcQuestionFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.service.findAllMeta(filter),
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
