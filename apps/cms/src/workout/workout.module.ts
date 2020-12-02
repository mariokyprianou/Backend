import { CommonModule } from '@lib/common';
import { ExerciseModule } from '@lib/power/exercise';
import { TrainerModule } from '@lib/power/trainer';
import { WorkoutModule } from '@lib/power/workout/workout.module';
import { Module } from '@nestjs/common';
import { WorkoutResolver } from './workout.resolver';

@Module({
  imports: [WorkoutModule, CommonModule, TrainerModule, ExerciseModule],
  providers: [WorkoutResolver],
})
export class WorkoutCMSModule {}
