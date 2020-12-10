import { Args, Query, Resolver } from '@nestjs/graphql';
import { CountryFilter, CountryService } from '@lib/power/country';

@Resolver('Country')
export class CountryResolver {
  constructor(private service: CountryService) {}

  @Query('Country')
  async Country(@Args('id') id) {
    return await this.service.findById(id);
  }

  @Query('allCountries')
  async allCountries(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'country',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: CountryFilter = {},
  ) {
    return this.service.findAll(page, perPage, sortField, sortOrder, filter);
  }
}
