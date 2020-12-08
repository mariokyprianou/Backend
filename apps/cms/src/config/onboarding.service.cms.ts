import { Injectable } from '@nestjs/common';
import { Onboarding } from '@lib/power/onboarding';

@Injectable()
export class CmsOnboardingService {
  public async findAll(): Promise<Onboarding[]> {
    return Onboarding.query()
      .withGraphJoined('translations')
      .orderBy('order_index', 'asc');
  }
}
