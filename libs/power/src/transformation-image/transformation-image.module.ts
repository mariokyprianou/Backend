/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Wed, 10th February 212021
 * Copyright 2021 - The Distance
 */

import { CommonModule } from '@lib/common';
import { Module } from '@nestjs/common';
import { AccountModule } from '../account';
import { TransformationImageService } from './transformation-image.service';

@Module({
  imports: [AccountModule, CommonModule],
  providers: [TransformationImageService],
  exports: [TransformationImageService],
})
export class TransformationImageModule {}
