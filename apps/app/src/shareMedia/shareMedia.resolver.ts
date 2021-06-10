import { ImageHandlerObjectStore, IMAGE_CDN } from '@lib/common';
import { Account, AuthContext, ProgrammeService } from '@lib/power';
import { Inject } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

@Resolver('ProgrammeShareImage')
export class ShareMediaResolver {
  constructor(
    private programmeService: ProgrammeService,
    @Inject(IMAGE_CDN) private imageStore: ImageHandlerObjectStore,
  ) {}

  @Query('shareMedia')
  async shareMedia(
    @Context('authContext') user: AuthContext,
    @Args('type') type: ShareMediaEnum,
  ): Promise<ProgrammeShareImage> {
    const account = await Account.query()
      .joinRelated('trainingProgramme')
      .select('trainingProgramme.training_programme_id as trainingProgrammeId')
      .findById(user.id)
      .toKnexQuery<{ trainingProgrammeId: string }>()
      .first();

    const shareMedia = await this.programmeService.findShareMedia(
      account.trainingProgrammeId,
      type,
    );

    if (!shareMedia) {
      return null;
    }

    const locale = shareMedia.localisations.find((e) => e.language === 'en');

    return {
      url: await this.imageStore.getSignedUrl(locale.imageKey, {
        expiresIn: 60 * 24 * 7,
        resize: { width: 720 },
      }),
      colour: locale.colour,
    };
  }
}

export enum ShareMediaEnum {
  WEEK_COMPLETE = 'WEEK_COMPLETE',
  CHALLENGE_COMPLETE = 'CHALLENGE_COMPLETE',
  PROGRESS = 'PROGRESS',
}

export interface ProgrammeShareImage {
  url: string;
  colour: string;
}
