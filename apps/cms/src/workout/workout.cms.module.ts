import { CommonModule } from '@lib/common';
import { ExerciseModule, WorkoutModule, TrainerModule } from '@lib/power';
import { Module } from '@nestjs/common';
import { ExerciseCMSModule } from '../exercise/exercise.module';
import { WorkoutWeekCmsResolver } from './workout-week.cms.resolver';
import { WorkoutCmsResolver } from './workout.cms.resolver';

@Module({
  imports: [
    WorkoutModule,
    CommonModule,
    TrainerModule,
    ExerciseModule,
    ExerciseCMSModule,
  ],
  providers: [WorkoutWeekCmsResolver, WorkoutCmsResolver],
})
export class WorkoutCMSModule {}
