import { Module } from '@nestjs/common';
import { ProgrammeService } from './programme.cms.service';
import { ProgrammeLoaders } from './programme.loaders';

@Module({
  providers: [ProgrammeService, ProgrammeLoaders],
  exports: [ProgrammeService, ProgrammeLoaders],
})
export class ProgrammeModule {}
