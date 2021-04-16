import { Module } from '@nestjs/common';
import { CommonModule } from '@lib/common';
import { ProgrammeWorkoutResolver } from './programme-workout.resolver';
import { WorkoutResolver } from './workout.resolver';
import { ProgrammeModule } from '@lib/power';

@Module({
  imports: [CommonModule, ProgrammeModule],
  providers: [WorkoutResolver, ProgrammeWorkoutResolver],
})
export class WorkoutAppModule {}
