import { UserModel } from '@lib/database';
import { snakeCaseMappers } from 'objection';

export class User extends UserModel {
  static tableName = 'account';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}
