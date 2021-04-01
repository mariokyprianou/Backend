import { Module } from '@nestjs/common';
import { TrainerLoaders } from './trainer.loaders';
import { TrainerService } from './trainer.service';

@Module({
  providers: [TrainerService, TrainerLoaders],
  exports: [TrainerService, TrainerLoaders],
})
export class TrainerModule {}
