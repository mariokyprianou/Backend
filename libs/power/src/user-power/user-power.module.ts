import { CommonModule } from '@lib/common';
import { Module } from '@nestjs/common';
import { AccountModule } from '../account';
import { UserProgrammeModule } from '../user-programme';
import { UserWorkoutModule } from '../user-workout';
import { UserWorkoutWeekModule } from '../user-workout-week';
import { ScheduledWorkoutModule } from '../scheduled-workout';
import { UserPowerLoaders } from './user-power.loaders';
import { UserPowerService } from './user-power.service';
import { WorkoutFeedbackModule } from '../feedback';

@Module({
  imports: [
    UserProgrammeModule,
    AccountModule,
    CommonModule,
    UserWorkoutModule,
    UserWorkoutWeekModule,
    ScheduledWorkoutModule,
    WorkoutFeedbackModule,
  ],
  providers: [UserPowerService, UserPowerLoaders],
  exports: [UserPowerService, UserPowerLoaders],
})
export class UserPowerModule {}
