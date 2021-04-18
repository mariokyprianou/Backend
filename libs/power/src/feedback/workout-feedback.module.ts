import { Module } from '@nestjs/common';
import { GenerateCsvReportModule } from '@td/generate-csv-report';
import { WorkoutFeedbackService } from './workout-feedback.service';

@Module({
  imports: [GenerateCsvReportModule],
  providers: [WorkoutFeedbackService],
  exports: [WorkoutFeedbackService],
})
export class WorkoutFeedbackModule {}
