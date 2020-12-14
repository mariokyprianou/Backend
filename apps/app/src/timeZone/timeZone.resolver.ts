import { Query, Resolver } from '@nestjs/graphql';
import { TimeZoneService } from '@lib/power/timeZone';

@Resolver('TimeZone')
export class TimeZoneResolver {
  constructor(private service: TimeZoneService) {}

  @Query('allTimeZones')
  async allTimeZones() {
    return this.service.findAll(0, 50);
  }
}
