import { CommonModule } from '@lib/common';
import { Config } from '@lib/power/config';
import { Module } from '@nestjs/common';
import { ConfigResolver } from './config.resolver';
import { CmsConfigService } from './config.service.cms';
import { CmsOnboardingService } from './onboarding.service.cms';

@Module({
  imports: [Config, CommonModule],
  providers: [ConfigResolver, CmsConfigService, CmsOnboardingService],
})
export class ConfigCMSModule {}
