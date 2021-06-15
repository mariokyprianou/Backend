/* eslint-disable @typescript-eslint/no-unused-vars */
import { ImageHandlerObjectStore, IMAGE_CDN } from '@lib/common';
import { Onboarding } from '@lib/power/onboarding';
import { Inject } from '@nestjs/common';
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
    @Inject(IMAGE_CDN) private imageStore: ImageHandlerObjectStore,
  ) {}

  @Query('onboardingScreens')
  async getOnboarding(@Context('language') language: string) {
    return (await this.onboardingService.findAll(language)).sort((a, b) =>
      a.orderIndex <= b.orderIndex ? 1 : 0,
    );
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
    return this.imageStore.getSignedUrl(key, {
      resize: { width: 720 },
      expiresIn: 60 * 24 * 7,
    });
  }
}
