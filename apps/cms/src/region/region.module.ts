import { RegionModule } from '@lib/power/region';
import { Module } from '@nestjs/common';
import { RegionResolver } from './region.resolver';

@Module({
  imports: [RegionModule],
  providers: [RegionResolver],
})
export class RegionCMSModule {}
