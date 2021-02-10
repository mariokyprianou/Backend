import { CommonModule } from '@lib/common';
import { ProgrammeModule } from '@lib/power/programme';
import { TrainerModule } from '@lib/power/trainer';
import { UserPowerModule } from '@lib/power/user-power';
import { WorkoutModule } from '@lib/power/workout';
import { Module } from '@nestjs/common';
import { TrainerResolver } from './trainer.resolver';

@Module({
  imports: [
    TrainerModule,
    CommonModule,
    ProgrammeModule,
    WorkoutModule,
    UserPowerModule,
  ],
  providers: [TrainerResolver],
})
export class TrainerAppModule {}
