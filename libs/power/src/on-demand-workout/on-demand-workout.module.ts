import { Module } from '@nestjs/common';
import { WorkoutModule } from '../workout';
import { OnDemandWorkoutService } from './on-demand-workout.service';

@Module({
  imports: [WorkoutModule],
  providers: [OnDemandWorkoutService],
  exports: [OnDemandWorkoutService],
})
export class OnDemandWorkoutModule {}
