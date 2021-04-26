import { Module } from '@nestjs/common';
import { ManualSubscriptionProvider } from './manual.provider';
import { ManualSubscriptionService } from './manual.service';

@Module({
  providers: [ManualSubscriptionProvider, ManualSubscriptionService],
  exports: [ManualSubscriptionProvider, ManualSubscriptionService],
})
export class ManualSubscriptionModule {}
