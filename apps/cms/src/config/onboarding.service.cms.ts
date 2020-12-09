import { Injectable } from '@nestjs/common';
import { Onboarding, OnboardingTranslation } from '@lib/power/onboarding';

@Injectable()
export class CmsOnboardingService {
  public async findAll(): Promise<Onboarding[]> {
    return Onboarding.query()
      .withGraphJoined('translations')
      .orderBy('order_index', 'asc');
  }

  public async updateTranslations(translations: OnboardingTranslationData[]) {
    for (const translation of translations) {
      await OnboardingTranslation.query()
        .whereExists(
          OnboardingTranslation.relatedQuery('onboarding').where(
            'order_index',
            translation.orderIndex,
          ),
        )
        .where('language', translation.language)
        .patch({
          title: translation.title,
          imageKey: translation.image,
          description: translation.description,
        });
    }
  }
}

export interface OnboardingTranslationData {
  orderIndex: number;
  language: string;
  title: string;
  description: string;
  image: string;
}
