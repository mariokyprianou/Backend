import { ConfigType } from '@lib/power/config';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { ConfigService } from '../../../../libs/power/src/config/config.service';

@Resolver('Legals')
export class ConfigResolver {
  constructor(private configService: ConfigService) {}

  @Query('legals')
  async legals(@Context('language') language: string) {
    const configs = await this.configService.findAll(language);
    return {
      termsAndConditions: configs.find((item) => item.type === ConfigType.TERMS)
        .translations[0].value,
      privacyPolicy: configs.find((item) => item.type === ConfigType.PRIVACY)
        .translations[0].value,
    };
  }
}
