import { Module } from '@nestjs/common';
import { OnboardingModule } from './onboarding';

@Module({
  providers: [OnboardingModule],
  exports: [OnboardingModule],
})
export class PowerModule {}
