import * as uuid from 'uuid';
import { Subscription, SubscriptionProvider } from '../subscription.interface';

import { SubscriptionModel } from '../model';
import { Injectable } from '@nestjs/common';
import { MANUAL_PROVIDER_NAME } from './manual.constants';
import { ManualToken } from './manual.interface';
import { SubscriptionPlanSku } from '../subscription.constants';

@Injectable()
export class ManualSubscriptionProvider implements SubscriptionProvider {
  public readonly providerName = MANUAL_PROVIDER_NAME;

  public async getSubscriptionInfo(
    model: SubscriptionModel,
  ): Promise<Subscription>;

  public async getSubscriptionInfo(
    providerToken: ManualToken,
  ): Promise<Subscription>;

  public async getSubscriptionInfo(
    subscriptionOrToken: SubscriptionModel | ManualToken,
  ): Promise<Subscription> {
    return {
      provider: this.providerName,
      lastVerifiedAt:
        (subscriptionOrToken as SubscriptionModel)?.lastVerifiedAt ??
        new Date(),
      transactionId:
        (subscriptionOrToken as SubscriptionModel).transactionId ?? uuid.v4(),
      isActive: true,
      sku: SubscriptionPlanSku.LIFETIME,
      expiresAt: new Date(9999, 0, 1),
      providerToken: subscriptionOrToken?.providerToken ?? {},
      providerResponse: subscriptionOrToken?.providerResponse ?? {},
    };
  }
}
