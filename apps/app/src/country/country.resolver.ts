import { Query, Resolver } from '@nestjs/graphql';
import { CountryService } from '@lib/power/country';

@Resolver('Country')
export class CountryResolver {
  constructor(private service: CountryService) {}

  @Query('allCountries')
  async allCountries() {
    return this.service.findAll(0, 250);
  }
}
