import { UserModule, WorkoutFeedbackModule } from '@lib/power';
import { Module } from '@nestjs/common';
import { GenerateCsvReportModule } from '@td/generate-csv-report';
import { FeedbackResolver } from './feedback.resolver';

@Module({
  imports: [GenerateCsvReportModule, UserModule, WorkoutFeedbackModule],
  providers: [FeedbackResolver],
})
export class FeedbackCMSModule {}
