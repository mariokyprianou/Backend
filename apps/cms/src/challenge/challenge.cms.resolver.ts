// import Objection from 'objection';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
// import { ListMetadata } from '@lib/power/types';
import { ChallengeService } from '@lib/power/challenge/challenge.service';
import { ChallengeType } from '@lib/power/challenge/challenge.model';

@Resolver('Challenge')
export class ChallengeResolver {
  constructor(private readonly service: ChallengeService) {}

  @Mutation('createChallenge')
  async createChallenge(
    @Args('input') input: CreateChallengeGraphQlInput,
  ): Promise<ChallengeGraphQlType> {
    return await this.service.create(input);
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
