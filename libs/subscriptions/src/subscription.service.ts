import { PartialModelObject } from 'objection';
import { SubscriptionModel } from './model';
import { Subscription, SubscriptionProvider } from './subscription.interface';

export class SubscriptionService {
  private readonly providers: Map<string, SubscriptionProvider> = new Map();

  constructor(providers: SubscriptionProvider[]) {
    providers.forEach((provider) =>
      this.providers.set(provider.providerName, provider),
    );
  }

  public async findSubscription(accountId: string) {
    const subscriptionModel = await SubscriptionModel.query().findOne({
      account_id: accountId,
    });

    if (!subscriptionModel) {
      return null;
    }

    const provider = this.providers.get(subscriptionModel.provider);
    const subscription = await provider.getSubscriptionInfo(subscriptionModel);
    if (!subscription) {
      return null;
    }

    if (subscription.lastVerifiedAt > subscriptionModel.lastVerifiedAt) {
      await subscriptionModel
        .$query()
        .patch(toSubscriptionModelData(accountId, subscription));
    }

    return subscription;
  }

  public async registerSubscription(params: {
    accountId: string;
    providerName: string;
    providerToken: any;
  }) {
    console.log(params);
    const provider = this.providers.get(params.providerName);
    if (!provider) {
      throw new Error(`Unknown subscription provider: ${params.providerName}`);
    }

    const subscription = await provider.getSubscriptionInfo(
      params.providerToken,
    );

    const existingSubscription = await SubscriptionModel.query().findOne({
      transaction_id: subscription.transactionId,
    });

    const patch = toSubscriptionModelData(params.accountId, subscription);
    if (!existingSubscription) {
      await SubscriptionModel.query().insert(patch);
    } else if (
      subscription.lastVerifiedAt > existingSubscription.lastVerifiedAt
    ) {
      await existingSubscription.$query().patch(patch);
    }

    return subscription;
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
