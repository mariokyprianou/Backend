import { Module } from '@nestjs/common';
import { CommonModule } from '@lib/common';
import { ProgrammeWorkoutResolver } from './programme-workout.resolver';
import { WorkoutResolver } from './workout.resolver';
import { ExerciseModule, ProgrammeModule } from '@lib/power';

@Module({
  imports: [CommonModule, ProgrammeModule, ExerciseModule],
  providers: [WorkoutResolver, ProgrammeWorkoutResolver],
})
export class WorkoutAppModule {}
