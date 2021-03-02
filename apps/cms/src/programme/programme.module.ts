import { CommonModule } from '@lib/common';
import { TrainerModule } from '@lib/power/trainer';
import { ProgrammeModule } from '@lib/power/programme/programme.module';
import { Module } from '@nestjs/common';
import { ProgrammeResolver } from './programme.resolver';
import { AccountModule } from '@lib/power/account';

@Module({
  imports: [ProgrammeModule, CommonModule, TrainerModule, AccountModule],
  providers: [ProgrammeResolver],
})
export class ProgrammeCMSModule {}
