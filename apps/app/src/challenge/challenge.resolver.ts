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
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Resolver('Challenge')
export class ChallengeResolver {
  constructor(
    private challengeService: ChallengeService,
    private configService: ConfigService,
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

    const { bucket, region } = this.configService.get('storage.files');
    const s3 = new S3({ region });
    return s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: challenge.imageKey,
      Expires: 60 * 60,
    });
  }
}

export interface ChallengeInput {
  challengeId: string;
  result: string;
}
