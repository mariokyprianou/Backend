import { CommonModule } from '@lib/common/common.module';
import { OnboardingModule } from '@lib/power/onboarding/onboarding.module';
import { Module } from '@nestjs/common';
import { OnboardingResolver } from './onboarding.resolver';

@Module({
  imports: [OnboardingModule, CommonModule],
  providers: [OnboardingResolver],
})
export class OnboardingAppModule {}
