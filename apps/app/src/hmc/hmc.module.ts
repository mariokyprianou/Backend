import { CommonModule } from '@lib/common/common.module';
import { TrainerModule } from '@lib/power/trainer';
import { ProgrammeModule } from '@lib/power/programme';
import { HmcQuestionModule } from '@lib/power/hmc-question/hmc-question.module';
import { WorkoutModule } from '@lib/power/workout';
import { Module } from '@nestjs/common';
import { HMCResolver } from './hmc.resolver';

@Module({
  imports: [
    HmcQuestionModule,
    CommonModule,
    WorkoutModule,
    ProgrammeModule,
    TrainerModule,
  ],
  providers: [HMCResolver],
})
export class HMCAppModule {}
