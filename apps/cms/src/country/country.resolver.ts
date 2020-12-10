import { Args, Query, Resolver } from '@nestjs/graphql';
import { CountryService } from '@lib/power/country';

@Resolver('Country')
export class CountryResolver {
  constructor(private service: CountryService) {}

  @Query('Country')
  async Country(@Args('id') id) {
    return await this.service.findById(id);
  }
}
