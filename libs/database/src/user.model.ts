import { Model, snakeCaseMappers } from 'objection';

export class UserModel extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
