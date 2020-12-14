import { Module } from '@nestjs/common';
import { UserWorkoutWeekService } from './user-workout-week.service';

@Module({
  providers: [UserWorkoutWeekService],
  exports: [UserWorkoutWeekService],
})
export class UserWorkoutWeekModule {}
