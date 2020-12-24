import { Args, Query, Resolver } from '@nestjs/graphql';
import { TimeZoneFilter, TimeZoneService } from '@lib/power/timeZone';
import { ListMetadata } from '@lib/power/types';

@Resolver('TimeZone')
export class TimeZoneResolver {
  constructor(private service: TimeZoneService) {}

  @Query('TimeZone')
  async TimeZone(@Args('id') id) {
    return await this.service.findById(id);
  }

  @Query('allTimeZones')
  async allTimeZones(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'time_zone',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: TimeZoneFilter = {},
  ) {
    return this.service.findAll(page, perPage, sortField, sortOrder, filter);
  }

  @Query('_allTimeZonesMeta')
  async _allTimeZonesMeta(
    @Args('filter') filter: TimeZoneFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.service.findAllMeta(filter),
    };
  }
}