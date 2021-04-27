import { EventEmitter2 } from 'eventemitter2';
import { PartialModelObject } from 'objection';
import { AppStoreToken } from './app-store';
import { SubscriptionUpdatedEvent } from './event/subscription-updated.event';
import { GooglePlayToken } from './google-play';
import { ManualToken } from './manual/manual.interface';
import { SubscriptionModel } from './model';
import { SubscriptionPlatform } from './subscription.constants';
import { Subscription, SubscriptionProvider } from './subscription.interface';

export class SubscriptionService {
  private readonly providers: Map<
    SubscriptionPlatform,
    SubscriptionProvider
  > = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    providers: SubscriptionProvider[],
  ) {
    providers.forEach((provider) =>
      this.providers.set(provider.platform, provider),
    );
  }

  public async findActiveSubscription(
    accountId: string,
    opts: { preventUpdate?: boolean } = {},
  ): Promise<Subscription> {
    const subscriptionModel = await SubscriptionModel.query()
      .where('account_id', accountId)
      .orderBy('expires_at', 'DESC')
      .first();

    if (!subscriptionModel) {
      return null;
    }

    if (opts.preventUpdate) {
      return subscriptionModel;
    }

    const provider = this.providers.get(subscriptionModel.provider);
    const subscription = await provider.getSubscriptionInfo(subscriptionModel);
    if (!subscription) {
      return null;
    }

    if (subscription.lastVerifiedAt > subscriptionModel.lastVerifiedAt) {
      await this.upsertSubscription(accountId, subscription, subscriptionModel);
    }

    return subscription;
  }

  private async upsertSubscription(
    accountId: string,
    subscription: Subscription,
    subscriptionModel?: SubscriptionModel,
  ) {
    const patch = toSubscriptionModelData(accountId, subscription);

    if (!subscriptionModel) {
      await SubscriptionModel.query().insert(patch);
    } else {
      await subscriptionModel
        .$query()
        .patch(toSubscriptionModelData(accountId, subscription));
    }

    await this.eventEmitter.emitAsync(
      'subscription.updated',
      new SubscriptionUpdatedEvent(accountId, subscription),
    );
  }

  public async registerSubscription(params: {
    accountId: string;
    platform: SubscriptionPlatform;
    providerToken: GooglePlayToken | AppStoreToken | ManualToken;
  }) {
    const provider = this.providers.get(params.platform);
    if (!provider) {
      throw new Error(`Unknown subscription provider: ${params.platform}`);
    }

    const subscription = await provider.getSubscriptionInfo(
      params.providerToken,
    );

    const existingSubscription = await SubscriptionModel.query().findOne({
      transaction_id: subscription.transactionId,
    });

    await this.upsertSubscription(
      params.accountId,
      subscription,
      existingSubscription,
    );

    return subscription;
  }

  public async setSubscriptionOverrideStatus(params: {
    accountId: string;
    enabled: boolean;
    expiresAt?: Date;
  }) {
    if (params.enabled) {
      return await this.registerSubscription({
        accountId: params.accountId,
        platform: SubscriptionPlatform.ManualOverride,
        providerToken: {
          accountId: params.accountId,
          expiresAt: params.expiresAt,
        },
      });
    }

    const subscription = await SubscriptionModel.query().findOne({
      account_id: params.accountId,
      provider: SubscriptionPlatform.ManualOverride,
    });

    if (!subscription) {
      // Nothing to disable
      return;
    }

    await subscription.$query().patch({ expiresAt: new Date() });
    await this.eventEmitter.emitAsync(
      'subscription.updated',
      new SubscriptionUpdatedEvent(params.accountId, subscription),
    );
  }
}

export function toSubscriptionModelData(
  accountId: string,
  subscription: Subscription,
): PartialModelObject<SubscriptionModel> {
  return {
    accountId,
    provider: subscription.provider,
    sku: subscription.sku,
    expiresAt: subscription.expiresAt,
    transactionId: subscription.transactionId,
    lastVerifiedAt: subscription.lastVerifiedAt,
    providerResponse: subscription.providerResponse,
    providerToken: subscription.providerToken,
  };
}
