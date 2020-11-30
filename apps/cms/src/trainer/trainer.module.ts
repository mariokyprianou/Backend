import { TrainerModule } from '@lib/power/trainer/trainer.module';
import { Module } from '@nestjs/common';
import { TrainerResolver } from './trainer.resolver';

@Module({
  imports: [TrainerModule],
  providers: [TrainerResolver],
})
export class TrainerCMSModule {}
