import { Injectable } from '@nestjs/common';
import { Config } from './config.model';

@Injectable()
export class ConfigService {
  public async findAll(language = 'en'): Promise<Config[]> {
    return Config.query()
      .withGraphJoined('translations')
      .modifyGraph('translations', (qb) => qb.where('language', language));
  }
}
