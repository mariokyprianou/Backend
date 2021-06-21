import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CountryService, Country } from '@lib/power/country';
import { count } from 'console';

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
    let country: Country = null;
    if (ipAddress) {
      country = await this.service.findByIpAddress(ipAddress, language);
    }

    if (!country) {
      country = await this.service.findByCode('IN', language);
    }

    return country;
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
