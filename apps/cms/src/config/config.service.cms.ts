import { Config, ConfigTranslation, ConfigType } from '@lib/power/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CmsConfigService {
  public async findAll(): Promise<Config[]> {
    return Config.query().withGraphJoined('translations');
  }

  // Note: I know this is slow (multiple db calls, but I want; sure how else to do it)
  // Maybe something to do with transactions
  public async updateTranslations(translations: ConfigTranslationData[]) {
    for (const translation of translations) {
      await ConfigTranslation.query()
        .whereExists(
          ConfigTranslation.relatedQuery('config').where(
            'type',
            translation.type,
          ),
        )
        .where('language', translation.language)
        .patch({
          value: translation.value,
          title: translation.title,
        });
    }
  }
}

export interface ConfigTranslationData {
  type: ConfigType;
  language: string;
  value: string;
  title: string;
}
