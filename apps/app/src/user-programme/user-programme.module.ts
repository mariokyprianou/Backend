import { Module } from '@nestjs/common';
import { UserProgrammeResolver } from './user-programme.resolver';
import { UserProgrammeQueryResolver } from './user-programme-queries.resolver';
import {
  UserExerciseNoteModule,
  ScheduledWorkoutModule,
  UserPowerModule,
  UserExerciseHistoryModule,
  TrainerModule,
  ProgrammeModule,
  AccountModule,
  WorkoutModule,
} from '@lib/power';
import { CommonModule } from '@lib/common';
import { UserWorkoutWeekResolver } from './user-workout-week.resolver';
import { UserWorkoutResolver } from './user-workout.resolver';
import { UserWorkoutExerciseResolver } from './user-workout-exercise.resolver';
import { ExerciseResolver } from './exercise.resolver';
import { CompleteWorkoutResponseResolver } from './complete-workout-response.resolver';
import { WorkoutTagAppModule } from '../workout-tags/workout-tag.app.module';

@Module({
  imports: [
    AccountModule,
    CommonModule,
    ProgrammeModule,
    UserPowerModule,
    UserExerciseHistoryModule,
    UserExerciseNoteModule,
    ScheduledWorkoutModule,
    TrainerModule,
    WorkoutModule,
    WorkoutTagAppModule,
  ],
  providers: [
    CompleteWorkoutResponseResolver,
    ExerciseResolver,
    UserProgrammeQueryResolver,
    UserProgrammeResolver,
    UserWorkoutExerciseResolver,
    UserWorkoutResolver,
    UserWorkoutWeekResolver,
  ],
})
export class UserProgrammeAuthModule {}
