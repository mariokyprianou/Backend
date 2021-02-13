/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Thu, 11th February 212021
 * Copyright 2021 - The Distance
 */

import { Module } from '@nestjs/common';
import { AccountModule } from '../account';
import { ProgressService } from './progress.service';

@Module({
  imports: [AccountModule],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
