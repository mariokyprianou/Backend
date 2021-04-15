import { CommonModule } from '@lib/common/common.module';
import { TrainerModule } from '@lib/power/trainer';
import { ScheduledWorkoutModule } from '@lib/power/scheduled-workout';
import { Module } from '@nestjs/common';
import { ProgrammeResolver } from './programme.app.resolver';
import { ProgrammeOverviewResolver } from './programme-overview.app.resolver';
import { ProgrammeModule } from '@lib/power';
import { UserPowerModule } from '@lib/power/user-power';

@Module({
  imports: [
    CommonModule,
    ScheduledWorkoutModule,
    TrainerModule,
    ProgrammeModule,
    UserPowerModule,
  ],
  providers: [ProgrammeResolver, ProgrammeOverviewResolver],
})
export class ProgrammeAppModule {}
