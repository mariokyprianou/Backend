import { CommonModule } from '@lib/common';
import { TrainerModule } from '@lib/power/trainer';
import { TransformationImageModule } from '@lib/power/transformation-image';
import { Module } from '@nestjs/common';
import { TransformationImageResolver } from './transformationImage.resolver';

@Module({
  imports: [TrainerModule, CommonModule, TransformationImageModule],
  providers: [TransformationImageResolver],
})
export class TransformationImageAuthModule {}
