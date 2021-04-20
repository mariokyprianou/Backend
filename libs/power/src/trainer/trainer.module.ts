import { Module } from '@nestjs/common';
import { TrainerLoaders } from './trainer.loaders';
import { TrainerCmsService } from './trainer.cms.service';
import { TrainerService } from './trainer.service';
import { ProgrammeModule } from '../programme';

@Module({
  imports: [ProgrammeModule],
  providers: [TrainerService, TrainerCmsService, TrainerLoaders],
  exports: [TrainerService, TrainerCmsService, TrainerLoaders],
})
export class TrainerModule {}
