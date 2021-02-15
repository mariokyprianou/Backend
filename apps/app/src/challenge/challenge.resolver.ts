import { AuthContext } from '@lib/power/types';
import { Challenge, ChallengeService } from '@lib/power/challenge';
import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ChallengeUnitType } from 'apps/cms/src/challenge/challenge.cms.resolver';

@Resolver('Challenge')
export class ChallengeResolver {
  constructor(private challengeService: ChallengeService) {}

  @Query('challenges')
  async challenges(
    @Context('authContext') authContext: AuthContext,
    @Context('language') language: string,
  ): Promise<ChallengeInt[]> {
    const challenges = await this.challengeService.findUserChallenges(
      language,
      authContext,
    );

    return challenges;
  }

  @Mutation('completeChallenge')
  async completeChallenge(
    @Context('authContext') authContext: AuthContext,
    @Args('input') input: ChallengeInput,
  ): Promise<boolean> {
    return this.challengeService.submitChallenge(input, authContext);
  }

  @Query('challengeHistory')
  async challengeHistory(
    @Context('authContext') authContext: AuthContext,
    @Context('language') language: string,
  ): Promise<ChallengeHistory[]> {
    return this.challengeService.findUserHistory(language, authContext);
  }
}

export interface ChallengeInput {
  challengeId: string;
  result: string;
}

export interface ChallengeHistory {
  challenge: ChallengeInt;
  history: ChallengeResult[];
}

export interface ChallengeResult {
  id: string;
  createdAt: Date;
  value: string;
}

export interface ChallengeInt {
  id: string;
  type: ChallengeType;
  name: string;
  fieldDescription: string;
  fieldTitle: string;
  createdAt?: Date;
  duration?: number;
  unitType?: ChallengeUnitType;
}

export enum ChallengeType {
  OTHER,
  COUNTDOWN,
  STOPWATCH,
}
