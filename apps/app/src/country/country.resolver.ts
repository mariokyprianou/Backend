import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CountryService, Country } from '@lib/power/country';

@Resolver('Country')
export class CountryResolver {
  constructor(private service: CountryService) {}

  @Query('allCountries')
  async allCountries() {
    return this.service.findAll(0, 250);
  }

  @ResolveField('country')
  getCountry(@Parent() country: Country) {
    return country.name;
  }

  @ResolveField('name')
  getName(@Parent() country: Country) {
    return country.name;
  }
}
