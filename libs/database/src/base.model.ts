import { Model, NotFoundError, snakeCaseMappers } from 'objection';

export class BaseModel extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static createNotFoundError() {
    return new NotFoundError({ modelClass: this });
  }
}
