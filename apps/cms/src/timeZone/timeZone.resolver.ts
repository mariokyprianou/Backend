import { Args, Query, Resolver } from '@nestjs/graphql';
import { TimeZoneService } from '@lib/power/timeZone';

@Resolver('TimeZone')
export class TimeZoneResolver {
  constructor(private service: TimeZoneService) {}

  @Query('TimeZone')
  async TimeZone(@Args('id') id) {
    return await this.service.findById(id);
  }
}
