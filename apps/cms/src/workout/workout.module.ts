import { CommonModule } from '@lib/common';
import { ExerciseModule } from '@lib/power/exercise';
import { TrainerModule } from '@lib/power/trainer';
import { WorkoutModule } from '@lib/power/workout/workout.module';
import { Module } from '@nestjs/common';
import { ExerciseCMSModule } from '../exercise/exercise.module';
import { WorkoutWeekResolver } from './workout-week.resolver';
import { WorkoutResolver } from './workout.resolver';

@Module({
  imports: [
    WorkoutModule,
    CommonModule,
    TrainerModule,
    ExerciseModule,
    ExerciseCMSModule,
  ],
  providers: [WorkoutWeekResolver, WorkoutResolver],
})
export class WorkoutCMSModule {}
