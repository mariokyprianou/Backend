import { UserModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Country } from '../country';

export class Region extends UserModel {
  static tableName = 'region';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  countryId: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;

  country: Country;

  static relationMappings = () => ({
    country: {
      relation: Model.BelongsToOneRelation,
      modelClass: Country,
      join: {
        from: 'region.country_id',
        to: 'country.id',
      },
    },
  });
}
