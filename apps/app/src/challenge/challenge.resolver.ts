import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ChallengeService, IChallenge, IChallengeHistory } from '@lib/power';
import { User } from '../context';
import { IMAGE_CDN, ImageHandlerObjectStore } from '@lib/common';
import { Inject } from '@nestjs/common';

@Resolver('Challenge')
export class ChallengeResolver {
  constructor(
    private challengeService: ChallengeService,
    @Inject(IMAGE_CDN) private imageStore: ImageHandlerObjectStore,
  ) {}

  @Query('challenges')
  async challenges(@User() user: User): Promise<IChallenge[]> {
    const challenges = await this.challengeService.findUserChallenges({
      accountId: user.id,
      language: user.language,
    });

    return challenges;
  }

  @Mutation('completeChallenge')
  async completeChallenge(
    @Args('input') input: ChallengeInput,
    @User() user: User,
  ): Promise<boolean> {
    return this.challengeService.submitChallenge({
      accountId: user.id,
      challengeId: input.challengeId,
      quantity: input.result,
    });
  }

  @Query('challengeHistory')
  async challengeHistory(@User() user: User): Promise<IChallengeHistory[]> {
    return this.challengeService.findUserHistory({
      accountId: user.id,
      language: user.language,
    });
  }

  @ResolveField('imageUrl')
  getImageUrl(@Parent() challenge: IChallenge) {
    if (!challenge.imageKey) {
      return null;
    }

    return this.imageStore.getSignedUrl(challenge.imageKey, {
      expiresIn: 60 * 24 * 7,
      resize: {
        width: 720,
      },
    });
  }

  @ResolveField('imageThumbnailUrl')
  getImageThumbnailUrl(@Parent() challenge: IChallenge) {
    if (!challenge.imageKey) {
      return null;
    }

    return this.imageStore.getSignedUrl(challenge.imageKey, {
      expiresIn: 60 * 24 * 7,
      resize: {
        width: 200,
      },
    });
  }
}

export interface ChallengeInput {
  challengeId: string;
  result: string;
}
