/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonService } from '@lib/common';
import { Onboarding } from '@lib/power/onboarding';
import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { OnboardingService } from '../../../../libs/power/src/onboarding/onboarding.service';

@Resolver('Onboarding')
export class OnboardingResolver {
  constructor(
    private onboardingService: OnboardingService,
    private common: CommonService,
  ) {}

  @Query('onboardingScreens')
  async getOnboarding(@Context('language') language: string) {
    return this.onboardingService.findAll(language);
  }

  @ResolveField('title')
  getTitle(
    @Parent() onboarding: Onboarding,
    @Context('language') language: string,
  ) {
    return onboarding.getTranslation(language)?.title;
  }

  @ResolveField('description')
  getDescription(
    @Parent() onboarding: Onboarding,
    @Context('language') language: string,
  ) {
    return onboarding.getTranslation(language)?.description;
  }

  @ResolveField('image')
  async getImage(
    @Parent() onboarding: Onboarding,
    @Context('language') language: string,
  ) {
    const key = onboarding.getTranslation(language)?.imageKey;
    return (
      key &&
      this.common.getPresignedUrl(
        key,
        this.common.env().FILES_BUCKET,
        'getObject',
      )
    );
  }
}
