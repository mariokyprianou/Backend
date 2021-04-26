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
    // No third party involvement so the token is always "up to date"
    if (subscriptionOrToken instanceof SubscriptionModel) {
      return subscriptionOrToken;
    }

    const expiresAt = subscriptionOrToken.expiresAt ?? new Date(9999, 0, 1);
    return {
      provider: this.platform,
      lastVerifiedAt: new Date(),
      transactionId: subscriptionOrToken.accountId,
      isActive: new Date() < expiresAt,
      sku: SubscriptionPlanSku.MANUAL,
      expiresAt,
      providerToken: subscriptionOrToken,
      providerResponse: {},
    };
  }
}
