import { CountryModule } from '@lib/power/country';
import { Module } from '@nestjs/common';
import { CountryResolver } from './country.resolver';

@Module({
  imports: [CountryModule],
  providers: [CountryResolver],
})
export class CountryCMSModule {}
