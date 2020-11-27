import { Injectable } from '@nestjs/common';
import { Onboarding } from './onboarding.model';

@Injectable()
export class OnboardingService {
  public async findAll(language = 'en'): Promise<Onboarding[]> {
    return Onboarding.query()
      .withGraphJoined('translations')
      .modifyGraph('translations', (qb) => qb.where('language', language))
      .orderBy('order_index', 'asc');
  }
}
