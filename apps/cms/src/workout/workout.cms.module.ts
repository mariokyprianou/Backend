import { CommonModule } from '@lib/common';
import {
  ExerciseModule,
  OnDemandWorkoutModule,
  ProgrammeModule,
  ScheduledWorkoutModule,
  TrainerModule,
  WorkoutModule,
} from '@lib/power';
import { Module } from '@nestjs/common';
import { ExerciseCMSModule } from '../exercise/exercise.module';
import { OnDemandWorkoutCmsResolver } from './on-demand-workout.cms.resolver';
import { ScheduledWorkoutCmsResolver } from './scheduled-workout.cms.resolver';
import { WorkoutExerciseCmsResolver } from './workout-exercise.cms.resolver';
import { WorkoutCmsResolver } from './workout.cms.resolver';

@Module({
  imports: [
    OnDemandWorkoutModule,
    ScheduledWorkoutModule,
    CommonModule,
    TrainerModule,
    ExerciseModule,
    ExerciseCMSModule,
    WorkoutModule,
    ProgrammeModule,
  ],
  providers: [
    OnDemandWorkoutCmsResolver,
    ScheduledWorkoutCmsResolver,
    WorkoutCmsResolver,
    WorkoutExerciseCmsResolver,
  ],
})
export class WorkoutCMSModule {}
