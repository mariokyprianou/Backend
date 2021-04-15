import { Module } from '@nestjs/common';
import { WorkoutModule } from '../workout';
import { ScheduledWorkoutService } from './scheduled-workout.service';

@Module({
  imports: [WorkoutModule],
  providers: [ScheduledWorkoutService],
  exports: [ScheduledWorkoutService],
})
export class ScheduledWorkoutModule {}
