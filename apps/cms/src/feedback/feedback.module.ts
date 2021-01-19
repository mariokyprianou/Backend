import { UserModule } from '@lib/power/user';
import { Module } from '@nestjs/common';
import { GenerateCsvReportModule } from '@td/generate-csv-report';
import { FeedbackResolver } from './feedback.cms.resolver';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [GenerateCsvReportModule, UserModule],
  providers: [FeedbackResolver, FeedbackService],
})
export class FeedbackCMSModule {}
