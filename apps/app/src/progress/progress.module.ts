import { ProgressModule } from '@lib/power/progress';
import { Module } from '@nestjs/common';
import { ProgressResolver } from './progress.resolver';

@Module({
  imports: [ProgressModule],
  providers: [ProgressResolver],
})
export class ProgressAppModule {}
