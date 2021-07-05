import { DatabaseModule } from '@lib/database';
import { Module } from '@nestjs/common';
import { ProgrammeScheduleResolver } from './programme-schedule.resolver';
import { ProgrammeScheduleService } from './programme-schedule.service';

@Module({
  imports: [DatabaseModule],
  providers: [ProgrammeScheduleResolver, ProgrammeScheduleService],
})
export class ProgrammeScheduleAppModule {}
