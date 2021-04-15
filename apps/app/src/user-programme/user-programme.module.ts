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
} from '@lib/power';
import { CommonModule } from '@lib/common';
import { UserWorkoutWeekResolver } from './user-workout-week.resolver';
import { UserWorkoutResolver } from './user-workout.resolver';
import { UserWorkoutExerciseResolver } from './user-workout-exercise.resolver';
import { ExerciseResolver } from './exercise.resolver';

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
  ],
  providers: [
    UserProgrammeQueryResolver,
    UserProgrammeResolver,
    UserWorkoutWeekResolver,
    UserWorkoutResolver,
    UserWorkoutExerciseResolver,
    ExerciseResolver,
  ],
})
export class UserProgrammeAuthModule {}
