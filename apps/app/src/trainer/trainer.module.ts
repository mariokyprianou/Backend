import { CommonModule } from '@lib/common';
import { ProgrammeModule } from '@lib/power/programme';
import { TrainerModule } from '@lib/power/trainer';
import { UserPowerModule } from '@lib/power/user-power';
import { ScheduledWorkoutModule } from '@lib/power/scheduled-workout';
import { Module } from '@nestjs/common';
import { TrainerResolver } from './trainer.resolver';

@Module({
  imports: [
    TrainerModule,
    CommonModule,
    ProgrammeModule,
    ScheduledWorkoutModule,
    UserPowerModule,
  ],
  providers: [TrainerResolver],
})
export class TrainerAppModule {}
