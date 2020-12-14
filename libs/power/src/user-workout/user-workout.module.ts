import { Module } from '@nestjs/common';
import { UserWorkoutService } from './user-workout.service';

@Module({
  providers: [UserWorkoutService],
  exports: [UserWorkoutService],
})
export class UserWorkoutModule {}
