import { Module } from '@nestjs/common';
import { CommonModule } from '@lib/common';
import { ProgrammeWorkoutResolver } from './programme-workout.resolver';
import { WorkoutResolver } from './workout.resolver';

@Module({
  imports: [CommonModule],
  providers: [WorkoutResolver, ProgrammeWorkoutResolver],
})
export class WorkoutAppModule {}
