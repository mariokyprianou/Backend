import { CommonService } from '@lib/common';
import { AccountService, AuthContext, ProgrammeService } from '@lib/power';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

@Resolver('ProgrammeShareImage')
export class ShareMediaResolver {
  constructor(
    private account: AccountService,
    private programme: ProgrammeService,
    private common: CommonService,
  ) {}

  @Query('shareMedia')
  async shareMedia(
    @Context('authContext') authContext: AuthContext,
    @Args('type') type: ShareMediaEnum,
  ): Promise<ProgrammeShareImage> {
    const account = await this.account
      .findBySub(authContext.sub)
      .withGraphFetched('trainingProgramme');

    const shareMedia = await this.programme.findShareMedia(
      account.trainingProgramme.trainingProgrammeId,
      type,
    );

    if (!shareMedia) {
      return null;
    }

    const locale = shareMedia.localisations.find((e) => e.language === 'en');

    return {
      url: await this.common.getPresignedUrl(
        locale.imageKey,
        this.common.env().FILES_BUCKET,
        'getObject',
      ),
      colour: locale.colour,
    };
  }
}

export enum ShareMediaEnum {
  WEEK_COMPLETE,
  CHALLENGE_COMPLETE,
  PROGRESS,
}

export interface ProgrammeShareImage {
  url: string;
  colour: string;
}
