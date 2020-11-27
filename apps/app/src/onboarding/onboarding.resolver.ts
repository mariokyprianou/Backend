/* eslint-disable @typescript-eslint/no-unused-vars */
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
  constructor(private onboardingService: OnboardingService) {}

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
  getImage(
    @Parent() onboarding: Onboarding,
    @Context('language') language: string,
  ) {
    // TODO RESOLVE TO S3
    return onboarding.getTranslation(language)?.imageKey;
  }
}
