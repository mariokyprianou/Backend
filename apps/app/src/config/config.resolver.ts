import { Config } from '@lib/power/config';
import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { config } from 'dotenv/types';
import { ConfigService } from '../../../../libs/power/src/config/config.service';

@Resolver('Configuration')
export class ConfigResolver {
  constructor(private configService: ConfigService) {}

  @Query('configuration')
  async getConfiguration(@Context('language') language: string) {
    const configs = await this.configService.findAll(language);
    return {
      termsAndConditions: configs.find((item) => item.key === 'terms')
        .translations[0].value,
      privacyPolicy: configs.find((item) => item.key === 'privacy')
        .translations[0].value,
    };
  }
}
