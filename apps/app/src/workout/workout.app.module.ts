import { Module } from '@nestjs/common';
import { CommonModule } from '@lib/common';
import { ProgrammeWorkoutResolver } from './programme-workout.resolver';
import { WorkoutResolver } from './workout.resolver';
import { ExerciseModule, ProgrammeModule } from '@lib/power';
import { WorkoutTagAppModule } from '../workout-tags/workout-tag.app.module';

@Module({
  imports: [CommonModule, ProgrammeModule, ExerciseModule, WorkoutTagAppModule],
  providers: [WorkoutResolver, ProgrammeWorkoutResolver],
})
export class WorkoutAppModule {}
