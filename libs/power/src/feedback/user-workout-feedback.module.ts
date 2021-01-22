import { Module } from '@nestjs/common';
import { UserWorkoutFeedbackService } from './user-workout-feedback.service';

@Module({
  providers: [UserWorkoutFeedbackService],
  exports: [UserWorkoutFeedbackService],
})
export class UserWorkoutFeedbackModule {}
