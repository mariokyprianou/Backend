import { UserModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Region } from '../region';

export class Country extends UserModel {
  static tableName = 'country';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  regions: Region[];

  static relationMappings = () => ({
    regions: {
      relation: Model.HasManyRelation,
      modelClass: Region,
      join: {
        from: 'country.id',
        to: 'region.country_id',
      },
    },
  });
}
