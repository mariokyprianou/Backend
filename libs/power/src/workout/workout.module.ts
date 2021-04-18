import { Module } from '@nestjs/common';
import { WorkoutLoaders } from './workout.loaders';
import { WorkoutService } from './workout.service';

@Module({
  providers: [WorkoutService, WorkoutLoaders],
  exports: [WorkoutService, WorkoutLoaders],
})
export class WorkoutModule {}
