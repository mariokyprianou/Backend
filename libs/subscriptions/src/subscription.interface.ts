import { SubscriptionModel } from './model';

export interface Subscription {
  /** A non-provider-specific id representing the subscription plan */
  sku: string;
  /** A unique id representing the subscription (usually provider assigned) */
  transactionId: string;
  /** Whether the subscription is currently usable */
  isActive: boolean;

  /** The subscription provider name */
  provider: string;
  /** The data required to request updated subscription info from the provider */
  providerToken: any;
  /** The most recent raw data received from the provider's api */
  providerResponse: any;

  /** The date the subscription is currently set to expire at */
  expiresAt: Date;
  /** When the subscription data was last updated **/
  lastVerifiedAt: Date;
}

export interface SubscriptionProvider {
  providerName: string;

  /**
   * Gets subscription info from the subscription provider. It is up to the
   * provider whether the information currently stored in the db is up-to-date
   * enough to be used directly, or whether to request refreshed data from the provider.
   *
   * @param providerToken the latest available token
   * @param subscription the current db subscription record
   */
  getSubscriptionInfo(
    providerToken: any,
    subscription?: SubscriptionModel,
  ): Promise<Subscription>;
}

export class AbstractSubscription<T, R> {
  constructor(
    public readonly provider: string,
    public readonly providerToken: T,
    public readonly providerResponse: R,
  ) {}
}
