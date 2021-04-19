import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Country, CountryFilter, CountryService } from '@lib/power/country';
import { ListMetadata } from '@lib/power/types';

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

  @Query('_allCountriesMeta')
  async _allCountriesMeta(
    @Args('filter') filter: CountryFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.service.findAllMeta(filter),
    };
  }

  @ResolveField('id')
  getId(@Parent() country: Country) {
    return country.id;
  }

  @ResolveField('code')
  getCode(@Parent() country: Country) {
    return country.code;
  }

  @ResolveField('name')
  getName(@Parent() country: Country) {
    return country.name;
  }

  /** @deprecated */
  @ResolveField('country')
  getCountry(@Parent() country: Country) {
    return country.name;
  }

  /** @deprecated */
  @ResolveField('regions')
  getRegions() {
    return [];
  }
}
