import { Module } from '@nestjs/common';
import { OnboardingModule } from './onboarding';
import { UserModule } from './user';

@Module({
  providers: [OnboardingModule, UserModule],
  exports: [OnboardingModule, UserModule],
})
export class PowerModule {}
