import { Args, Query, Resolver } from '@nestjs/graphql';
import { RegionService } from '@lib/power/region';

@Resolver('Region')
export class RegionResolver {
  constructor(private service: RegionService) {}

  @Query('Region')
  async Region(@Args('id') id) {
    return await this.service.findById(id);
  }
}
