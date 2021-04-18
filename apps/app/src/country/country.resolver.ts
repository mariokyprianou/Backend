import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CountryService, Country } from '@lib/power/country';

@Resolver('Country')
export class CountryResolver {
  constructor(private service: CountryService) {}

  @Query('allCountries')
  async allCountries(@Context('language') language: string) {
    return this.service.getAll(language);
  }

  @Query('lookupCountry')
  async lookupCountry(
    @Context('language') language: string,
    @Context('ipAddress') ipAddress: string,
  ) {
    if (ipAddress) {
      return this.service.findByIpAddress(ipAddress, language);
    }
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
