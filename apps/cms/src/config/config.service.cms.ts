import { Config } from '@lib/power/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CmsConfigService {
  public async findAll(): Promise<Config[]> {
    return Config.query().withGraphJoined('translations');
  }
}
