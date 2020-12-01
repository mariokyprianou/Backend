import { Context, Query, Resolver } from '@nestjs/graphql';
import { ConfigService } from '../../../../libs/power/src/config/config.service';

@Resolver('Configuration')
export class ConfigResolver {
  constructor(private configService: ConfigService) {}

  @Query('getLegals')
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
