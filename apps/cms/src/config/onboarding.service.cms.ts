import { Injectable } from '@nestjs/common';
import { Onboarding, OnboardingTranslation } from '@lib/power/onboarding';

@Injectable()
export class CmsOnboardingService {
  public async findAll(): Promise<Onboarding[]> {
    return Onboarding.query()
      .withGraphJoined('translations')
      .orderBy('order_index', 'asc');
  }

  public async updateTranslations(onboarding: OnboardingServiceType[]) {
    // for (const translation of translations) {
    //   await OnboardingTranslation.query()
    //     .whereExists(
    //       OnboardingTranslation.relatedQuery('onboarding').where(
    //         'order_index',
    //         translation.orderIndex,
    //       ),
    //     )
    //     .where('language', translation.language)
    //     .patch({
    //       title: translation.title,
    //       imageKey: translation.image,
    //       description: translation.description,
    //     });
    // }
    return Onboarding.transaction(async (trx) => {
      // Clean up previous
      await OnboardingTranslation.query(trx).del();
      await Onboarding.query(trx).del();

      await Onboarding.query(trx).insertGraph(onboarding);
    });
  }
}

export interface OnboardingTranslationData {
  orderIndex: number;
  language: string;
  title: string;
  description: string;
  image: string;
}

export interface OnboardingTranslationType {
  language: string;
  title: string;
  description: string;
  imageKey: string;
}
export interface OnboardingServiceType {
  orderIndex: number;
  localisations: OnboardingTranslationType[];
}
