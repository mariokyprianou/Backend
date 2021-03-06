import { UserModel } from '@lib/database';
import { SubscriptionPlatform } from '@td/subscriptions';
import { Model, snakeCaseMappers } from 'objection';
import { Country } from '../country';
import { Region } from '../region';

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
  timeZone: string;
  deviceUdid: string;
  dateOfBirth: Date;
  gender: string;
  deviceChange: Date;
  createdAt: Date;
  updatedAt: Date;

  // Preferences
  allowEmailMarketing: boolean;
  allowErrorReports: boolean;
  allowAnalytics: boolean;
  allowNotifications: boolean;

  subscriptionPlatform: SubscriptionPlatform | null;
  subscriptionExpiresAt: Date;

  country: Country;
  region: Region;

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
  });
}
