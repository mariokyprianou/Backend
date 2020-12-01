import { Module } from '@nestjs/common';
import { ProgrammeService } from './programme.service';

@Module({
  providers: [ProgrammeService],
  exports: [ProgrammeService],
})
export class ProgrammeModule {}
