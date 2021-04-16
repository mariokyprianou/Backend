import { CommonModule } from '@lib/common';
import { OnDemandWorkoutModule, ProgrammeModule } from '@lib/power';
import { Module } from '@nestjs/common';
import { OnDemandWorkoutAppResolver } from './on-demand-workout.app.resolver';

@Module({
  imports: [CommonModule, OnDemandWorkoutModule, ProgrammeModule],
  providers: [OnDemandWorkoutAppResolver],
})
export class OnDemandWorkoutAppModule {}
