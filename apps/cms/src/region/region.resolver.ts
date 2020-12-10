import { Args, Query, Resolver } from '@nestjs/graphql';
import { RegionFilter, RegionService } from '@lib/power/region';

@Resolver('Region')
export class RegionResolver {
  constructor(private service: RegionService) {}

  @Query('Region')
  async Region(@Args('id') id) {
    return await this.service.findById(id);
  }

  @Query('allRegions')
  async allRegions(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'region',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: RegionFilter = {},
  ) {
    return this.service.findAll(page, perPage, sortField, sortOrder, filter);
  }
}
