import { BaseModel } from '@lib/database';
import { SubscriptionPlatform } from '../subscription.constants';

export class SubscriptionModel extends BaseModel {
  static tableName = 'subscription';
  static idColumn = 'id';

  static jsonAttributes = ['providerToken', 'providerResponse'];

  id: string;

  accountId: string;
  sku: string;

  transactionId: string;
  expiresAt: Date;
  lastVerifiedAt: Date;

  provider: SubscriptionPlatform;
  providerToken: any;
  providerResponse: any;

  createdAt: Date;
  updatedAt: Date;

  get isActive() {
    return this.expiresAt > new Date();
  }
}
