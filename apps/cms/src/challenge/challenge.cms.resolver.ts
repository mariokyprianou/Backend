import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import {
  ChallengeFilter,
  ChallengeService,
} from '@lib/power/challenge/challenge.service';
import { ChallengeType } from '@lib/power/challenge/challenge.model';

@Resolver('Challenge')
export class ChallengeResolver {
  constructor(private readonly service: ChallengeService) {}

  @Query('Challenge')
  async Challenge(@Args('id') id): Promise<ChallengeGraphQlType> {
    return await this.service.findById(id);
  }

  @Query('allChallenges')
  async allChallenges(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: ChallengeFilter = {},
  ): Promise<ChallengeGraphQlType[]> {
    return this.service.findAll(page, perPage, sortField, sortOrder, filter);
  }

  @Query('_allChallengesMeta')
  async _allChallengesMeta(
    @Args('filter') filter: ChallengeFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.service.findAllMeta(filter),
    };
  }

  @Mutation('createChallenge')
  async createChallenge(
    @Args('input') input: CreateChallengeGraphQlInput,
  ): Promise<ChallengeGraphQlType> {
    return await this.service.create(input);
  }

  @Mutation('updateChallenge')
  async updateChallenge(
    @Args('input') input: UpdateChallengeGraphQlInput,
  ): Promise<ChallengeGraphQlType> {
    return await this.service.update(input);
  }

  @Mutation('deleteChallenge')
  async deleteChallenge(@Args('id') id: string): Promise<ChallengeGraphQlType> {
    return await this.service.delete(id);
  }
}

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

export interface UpdateChallengeGraphQlInput
  extends CreateChallengeGraphQlInput {
  id: string;
}
