import Objection from 'objection';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import { ChallengeService } from '@lib/power/challenge/challenge.service';
import { Challenge, ChallengeType } from '@lib/power/challenge/challenge.model';

@Resolver('Challenge')
export class ChallengeResolver {
  constructor(private readonly service: ChallengeService) {}

  @Query('allChallenges')
  async allChallenges(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: ChallengeFilter = {},
  ): Promise<ChallengeGraphQlType[]> {
    const findAllQuery = applyFilter(this.service.findAll(), filter);

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return await findAllQuery;
  }

  @Query('_allChallengesMeta')
  async _allChallengesMeta(
    @Args('filter') filter: ChallengeFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await applyFilter(this.service.findAll(), filter).resultSize(),
    };
  }

  @Mutation('createChallenge')
  async createChallenge(
    @Args('input') input: CreateChallengeGraphQlInput,
  ): Promise<ChallengeGraphQlType> {
    return await this.service.create(input);
  }
}

const applyFilter = (
  hmcQuestionQuery: Objection.QueryBuilder<Challenge, Challenge[]>,
  filter: ChallengeFilter,
): Objection.QueryBuilder<Challenge, Challenge[]> => {
  if (filter.id) {
    hmcQuestionQuery.findByIds([filter.id]);
  }

  if (filter.ids) {
    hmcQuestionQuery.findByIds(filter.ids);
  }

  if (filter.type) {
    hmcQuestionQuery.where('type', filter.type);
  }

  return hmcQuestionQuery;
};

interface ChallengeGraphQlType {
  id: string;
  type: ChallengeType;
  localisations: ChallengeLocalisationGraphQlType[];
}

interface ChallengeLocalisationGraphQlType {
  language: string;
  name: string;
  fieldTitle: string;
  fieldDescription: string;
}

// TODO: move to common?
export interface CreateChallengeGraphQlInput {
  type: ChallengeType;
  duration: number;
  localisations: ChallengeLocalisationGraphQlType[];
}

interface ChallengeFilter {
  id?: string;
  ids?: string[];
  type?: ChallengeType;
}
