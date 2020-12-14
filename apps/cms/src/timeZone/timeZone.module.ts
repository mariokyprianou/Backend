import { TimeZoneModule } from '@lib/power/timeZone';
import { Module } from '@nestjs/common';
import { TimeZoneResolver } from './timeZone.resolver';

@Module({
  imports: [TimeZoneModule],
  providers: [TimeZoneResolver],
})
export class TimeZoneCMSModule {}
