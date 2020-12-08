import { Module } from '@nestjs/common';
import { FeedbackResolver } from './feedback.cms.resolver';
import { FeedbackService } from './feedback.service';

@Module({
  providers: [FeedbackResolver, FeedbackService],
})
export class FeedbackCMSModule {}
