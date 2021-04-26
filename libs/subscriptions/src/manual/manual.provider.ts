import * as uuid from 'uuid';
import { Subscription, SubscriptionProvider } from '../subscription.interface';

import { SubscriptionModel } from '../model';
import { Injectable } from '@nestjs/common';
import { ManualToken } from './manual.interface';
import {
  SubscriptionPlanSku,
  SubscriptionPlatform,
} from '../subscription.constants';

@Injectable()
export class ManualSubscriptionProvider implements SubscriptionProvider {
  public readonly platform = SubscriptionPlatform.ManualOverride;

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
      provider: this.platform,
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
