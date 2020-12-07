import { Module } from '@nestjs/common';
import { FeedbackResolver } from './feedback.cms.resolver';
import { FeedbackModule } from '@lib/power/feedback/feedback.module';

@Module({
  imports: [FeedbackModule],
  providers: [FeedbackResolver],
})
export class FeedbackCMSModule {}
