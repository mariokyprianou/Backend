import { Module } from '@nestjs/common';
import { CommonModule } from '@lib/common';
import { ProgrammeWorkoutResolver } from './programme-workout.resolver';
import { WorkoutResolver } from './workout.resolver';
import { ExerciseModule, ProgrammeModule, UserPowerModule } from '@lib/power';
import { WorkoutTagAppModule } from '../workout-tags/workout-tag.app.module';
import { WorkoutExerciseResolver } from './workout-exercise.resolver';

@Module({
  imports: [
    CommonModule,
    ProgrammeModule,
    ExerciseModule,
    WorkoutTagAppModule,
    UserPowerModule,
  ],
  providers: [
    WorkoutResolver,
    WorkoutExerciseResolver,
    ProgrammeWorkoutResolver,
  ],
})
export class WorkoutAppModule {}
