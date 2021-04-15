import { CommonModule } from '@lib/common';
import {
  TrainerModule,
  ProgrammeModule,
  HmcQuestionModule,
  ScheduledWorkoutModule,
} from '@lib/power';
import { Module } from '@nestjs/common';
import { HMCResolver } from './hmc.resolver';

@Module({
  imports: [
    HmcQuestionModule,
    CommonModule,
    ScheduledWorkoutModule,
    ProgrammeModule,
    TrainerModule,
  ],
  providers: [HMCResolver],
})
export class HMCAppModule {}
