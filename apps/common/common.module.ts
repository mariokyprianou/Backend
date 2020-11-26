import { Module } from '@nestjs/common';
import { CommonResolver } from './common.resolver';

@Module({
  providers: [CommonResolver],
})
export class CommonModule {}
