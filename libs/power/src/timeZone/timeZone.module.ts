import { Module } from '@nestjs/common';
import { TimeZoneService } from './timeZone.service';

@Module({
  providers: [TimeZoneService],
  exports: [TimeZoneService],
})
export class TimeZoneModule {}
