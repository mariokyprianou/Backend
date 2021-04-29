import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import {
  ChallengeFilter,
  ChallengeService,
} from '@lib/power/challenge/challenge.service';
import { Challenge } from '@lib/power';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
} from '@lib/power/challenge/dto';

@Resolver('Challenge')
export class ChallengeResolver {
  constructor(private readonly challengeService: ChallengeService) {}

  @Query('Challenge')
  async Challenge(@Args('id') id): Promise<Challenge> {
    return await this.challengeService.findById(id);
  }

  @Query('allChallenges')
  async allChallenges(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: ChallengeFilter = {},
  ): Promise<Challenge[]> {
    return this.challengeService.findAll(
      page,
      perPage,
      sortField,
      sortOrder,
      filter,
    );
  }

  @Query('_allChallengesMeta')
  async _allChallengesMeta(
    @Args('filter') filter: ChallengeFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.challengeService.findAllMeta(filter),
    };
  }

  @ResolveField('image')
  public getImage(@Parent() challenge: Challenge) {
    return challenge.imageKey;
  }

  @Mutation('createChallenge')
  async createChallenge(
    @Args('input') input: CreateChallengeDto,
  ): Promise<Challenge> {
    return await this.challengeService.create(input);
  }

  @Mutation('updateChallenge')
  async updateChallenge(
    @Args('input') input: UpdateChallengeDto,
  ): Promise<Challenge> {
    return await this.challengeService.update(input);
  }

  @Mutation('deleteChallenge')
  async deleteChallenge(@Args('id') id: string): Promise<Challenge> {
    return await this.challengeService.delete(id);
  }
}
