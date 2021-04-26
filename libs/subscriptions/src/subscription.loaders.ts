import { Injectable, Scope } from '@nestjs/common';

import * as DataLoader from 'dataloader';
import { raw } from 'objection';
import { SubscriptionModel } from './model';

export interface SubscriptionStatus {
  accountId: string;
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  platform: string;
}

@Injectable({ scope: Scope.REQUEST })
export class SubscriptionLoaders {
  public findActiveSubscriptionByAccountId = new DataLoader<
    string,
    SubscriptionStatus | null
  >(async (accountIds) => {
    const subscriptions = await SubscriptionModel.query()
      .select(
        raw('DISTINCT ON ("account_id") id'),
        'account_id',
        'created_at',
        'expires_at',
        'provider',
      )
      .whereIn('account_id', accountIds as string[])
      .orderBy('account_id', 'ASC')
      .orderBy('expires_at', 'DESC');

    return accountIds
      .map((id) => subscriptions.find((s) => s.accountId === id))
      .map<SubscriptionStatus | null>((subscription) => {
        if (!subscription) {
          return null;
        }

        return {
          accountId: subscription.accountId,
          startedAt: subscription.createdAt,
          expiresAt: subscription.expiresAt,
          isActive: subscription.isActive,
          platform: subscription.provider,
        };
      });
  });
}
