import { Module } from '@nestjs/common';
import { GenerateCsvReportModule } from '@td/generate-csv-report';
import { UserWorkoutFeedbackService } from './user-workout-feedback.service';

@Module({
  imports: [GenerateCsvReportModule],
  providers: [UserWorkoutFeedbackService],
  exports: [UserWorkoutFeedbackService],
})
export class UserWorkoutFeedbackModule {}
