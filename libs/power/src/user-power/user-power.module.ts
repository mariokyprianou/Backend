import { CommonModule } from '@lib/common';
import { Module } from '@nestjs/common';
import { AccountModule } from '../account';
import { UserProgrammeModule } from '../user-programme';
import { UserWorkoutModule } from '../user-workout';
import { UserWorkoutWeekModule } from '../user-workout-week';
import { UserPowerService } from './user-power.service';

@Module({
  imports: [
    UserProgrammeModule,
    AccountModule,
    CommonModule,
    UserWorkoutModule,
    UserWorkoutWeekModule,
  ],
  providers: [UserPowerService],
  exports: [UserPowerService],
})
export class UserPowerModule {}
