import { OnboardingModule } from '@lib/power/onboarding/onboarding.module';
import { Module } from '@nestjs/common';
import { OnboardingResolver } from './onboarding.resolver';

@Module({
  imports: [OnboardingModule],
  providers: [OnboardingResolver],
})
export class OnboardingAppModule {}
