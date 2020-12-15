import { UserModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Country } from '../country';
import { Region } from '../region';
import { TimeZone } from '../timeZone';

export class User extends UserModel {
  static tableName = 'account';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  cognitoSub: string;
  firstName: string;
  lastName: string;
  email: string;
  countryId: string;
  regionId: string;
  timeZoneId: string;
  deviceUdid: string;
  dateOfBirth: string;
  gender: string;
  createdAt: Date;
  updatedAt: Date;

  country: Country;
  region: Region;
  timeZone: TimeZone;

  static relationMappings = () => ({
    country: {
      relation: Model.HasOneRelation,
      modelClass: Country,
      join: {
        from: 'account.country_id',
        to: 'country.id',
      },
    },
    region: {
      relation: Model.HasOneRelation,
      modelClass: Region,
      join: {
        from: 'account.region_id',
        to: 'region.id',
      },
    },
    timeZone: {
      relation: Model.HasOneRelation,
      modelClass: TimeZone,
      join: {
        from: 'account.time_zone_id',
        to: 'time_zone.id',
      },
    },
  });
}
