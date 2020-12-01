import { CommonModule } from '@lib/common';
import { TrainerModule } from '@lib/power/trainer';
import { ProgrammeModule } from '@lib/power/programme/programme.module';
import { Module } from '@nestjs/common';
import { ProgrammeResolver } from './programme.resolver';

@Module({
  imports: [ProgrammeModule, CommonModule, TrainerModule],
  providers: [ProgrammeResolver],
})
export class ProgrammeCMSModule {}
