import { UserWorkoutFeedbackModule } from '@lib/power/feedback';
import { UserModule } from '@lib/power/user';
import { Module } from '@nestjs/common';
import { GenerateCsvReportModule } from '@td/generate-csv-report';
import { FeedbackResolver } from './feedback.resolver';

@Module({
  imports: [GenerateCsvReportModule, UserModule, UserWorkoutFeedbackModule],
  providers: [FeedbackResolver],
})
export class FeedbackCMSModule {}
