import { Module } from '@nestjs/common';
import { WorkoutModule } from '../workout';
import { OnDemandWorkoutService } from './on-demand-workout.service';
import { OnDemandWorkoutCmsService } from './on-demand-workout.cms.service';

@Module({
  imports: [WorkoutModule],
  providers: [OnDemandWorkoutService, OnDemandWorkoutCmsService],
  exports: [OnDemandWorkoutService, OnDemandWorkoutCmsService],
})
export class OnDemandWorkoutModule {}
