import { AuthContext } from '@lib/power/types';
import { ChallengeService } from '@lib/power/challenge';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChallengeUnitType } from 'apps/cms/src/challenge/challenge.cms.resolver';

@Resolver('Challenge')
export class ChallengeResolver {
  constructor(private challengeService: ChallengeService) {}

  @Query('challenges')
  async challenges(
    @Context('authContext') user: AuthContext,
    @Context('language') language: string,
  ): Promise<ChallengeInt[]> {
    const challenges = await this.challengeService.findUserChallenges({
      accountId: user.id,
      language,
    });

    return challenges;
  }

  @Mutation('completeChallenge')
  async completeChallenge(
    @Args('input') input: ChallengeInput,
    @Context('authContext') user: AuthContext,
  ): Promise<boolean> {
    return this.challengeService.submitChallenge({
      accountId: user.id,
      challengeId: input.challengeId,
      quantity: input.result,
    });
  }

  @Query('challengeHistory')
  async challengeHistory(
    @Context('authContext') user: AuthContext,
    @Context('language') language: string,
  ): Promise<ChallengeHistory[]> {
    return this.challengeService.findUserHistory({
      accountId: user.id,
      language,
    });
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
