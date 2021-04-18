import { Module } from '@nestjs/common';
import { WorkoutModule } from '../workout';
import { OnDemandWorkoutService } from './on-demand-workout.service';
import { OnDemandWorkoutCmsService } from './on-demand-workout.cms.service';
import { WorkoutFeedbackModule } from '../feedback';

@Module({
  imports: [WorkoutModule, WorkoutFeedbackModule],
  providers: [OnDemandWorkoutService, OnDemandWorkoutCmsService],
  exports: [OnDemandWorkoutService, OnDemandWorkoutCmsService],
})
export class OnDemandWorkoutModule {}
