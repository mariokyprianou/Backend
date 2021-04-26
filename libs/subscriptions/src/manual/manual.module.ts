import { Module } from '@nestjs/common';
import { ManualSubscriptionProvider } from './manual.provider';

@Module({
  providers: [ManualSubscriptionProvider],
  exports: [ManualSubscriptionProvider],
})
export class ManualSubscriptionModule {}
