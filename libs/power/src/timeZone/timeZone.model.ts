import { UserModel } from '@lib/database';
import { snakeCaseMappers } from 'objection';

export class TimeZone extends UserModel {
  static tableName = 'time_zone';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  timeZone: string;
  createdAt: Date;
  updatedAt: Date;
}
