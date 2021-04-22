import { BaseModel } from '@lib/database';

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

  provider: string;
  providerToken: any;
  providerResponse: any;

  createdAt: Date;
  updatedAt: Date;
}
