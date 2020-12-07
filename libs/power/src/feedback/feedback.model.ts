import { BaseModel } from '@lib/database';
import { snakeCaseMappers } from 'objection';

// TODO!
export class Feedback extends BaseModel {
  static get columnNameMappers() {
    return snakeCaseMappers({ underscoreBeforeDigits: true });
  }

  id: string;
}
