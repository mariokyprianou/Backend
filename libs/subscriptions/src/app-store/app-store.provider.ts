import { Injectable } from '@nestjs/common';
import { SubscriptionModel } from '../model';
import { Subscription, SubscriptionProvider } from '../subscription.interface';
import { AppStoreClient } from './app-store.client';
import { APP_STORE_PROVIDER_NAME } from './app-store.constants';
import { AppStoreSubscription } from './app-store.subscription';

export type AppStoreProviderCtorParams = {
  sku: string;
  productIds: [string];
};

@Injectable()
export class AppStoreSubscriptionProvider implements SubscriptionProvider {
  readonly providerName: string = APP_STORE_PROVIDER_NAME;
  readonly sku: string;
  readonly productIds: string[];

  constructor(
    private readonly client: AppStoreClient,
    params: AppStoreProviderCtorParams,
  ) {
    this.sku = params.sku;
    this.productIds = params.productIds;
  }

  async getSubscriptionInfo(
    receiptOrSubscription: string | SubscriptionModel,
  ): Promise<Subscription> {
    let receipt: string;
    if (receiptOrSubscription instanceof SubscriptionModel) {
      const { providerResponse, transactionId } = receiptOrSubscription;
      receipt = receiptOrSubscription.providerToken;
      const subscription = AppStoreSubscription.fromApiResponse(
        providerResponse,
        this.productIds,
        transactionId,
      );

      // Return without querying API if subscription is definitely still active
      if (subscription.isActive && !subscription.isStale()) {
        return subscription;
      }
    } else {
      receipt = receiptOrSubscription;
    }

    const subscriptionDetails = await this.fetchLatestReceiptData(receipt);

    const subscription = AppStoreSubscription.fromApiResponse(
      subscriptionDetails,
      this.productIds,
    );

    return subscription;
  }

  private fetchLatestReceiptData(token: string) {
    return this.client.verifyReceipt(token, true);
  }
}
