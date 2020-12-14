import { Query, Resolver } from '@nestjs/graphql';
import { RegionService } from '@lib/power/region';

@Resolver('Region')
export class RegionResolver {
  constructor(private service: RegionService) {}

  @Query('allRegions')
  async allRegions() {
    return this.service.findAll(0, 250);
  }
}
