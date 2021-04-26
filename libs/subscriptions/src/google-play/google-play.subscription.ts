import { SubscriptionPlatform } from '../subscription.constants';
import { AbstractSubscription, Subscription } from '../subscription.interface';
import {
  GooglePlaySubscriptionResponse,
  GooglePlayToken,
  NotificationType,
} from './google-play.interface';

export class GooglePlaySubscription
  extends AbstractSubscription<GooglePlayToken, GooglePlaySubscriptionResponse>
  implements Subscription {
  constructor(
    token: GooglePlayToken,
    response: GooglePlaySubscriptionResponse,
  ) {
    super(SubscriptionPlatform.GooglePlay, token, response);
  }

  providerResponse: GooglePlaySubscriptionResponse;

  startTimeMillis: number;
  expiryTimeMillis: number;
  autoResumeTimeMillis: number;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: number;
  countryCode: string;
  paymentState: number;
  cancelReason: number;
  userCancellationTimeMillis: number;
  orderId: string;
  linkedPurchaseToken: string;
  purchaseType?: number;

  // Library-managed Purchase properties
  packageName: string;
  purchaseToken: string;
  sku: string;
  userId?: string;
  verifiedAt: number; // timestamp of last purchase verification by Play Developer API
  replacedByAnotherPurchase: boolean;
  isMutable: boolean; // indicate if the subscription purchase details can be changed in the future (i.e. expiry date changed because of auto-renewal)
  latestNotificationType?: NotificationType;

  // Convert raw api response from Play Developer API to an SubscriptionPurchase object
  static fromApiResponse(
    response: GooglePlaySubscriptionResponse,
    token: GooglePlayToken,
    verifiedAt: Date,
  ): GooglePlaySubscription {
    // Intentionally hide developerPayload as the field was deprecated
    response.developerPayload = null;

    const purchase = new GooglePlaySubscription(token, response);
    Object.assign(purchase, response);
    purchase.providerResponse = response;

    purchase.purchaseToken = token.purchaseToken;
    purchase.sku = token.productId;
    purchase.packageName = token.packageName;
    purchase.verifiedAt = verifiedAt.getTime();
    purchase.replacedByAnotherPurchase = false;

    // Play Developer API subscriptions:get returns some properties as string instead of number as documented. We do some type correction here to fix that
    if (purchase.startTimeMillis)
      purchase.startTimeMillis = Number(purchase.startTimeMillis);
    if (purchase.expiryTimeMillis)
      purchase.expiryTimeMillis = Number(purchase.expiryTimeMillis);
    if (purchase.autoResumeTimeMillis)
      purchase.autoResumeTimeMillis = Number(purchase.autoResumeTimeMillis);
    if (purchase.priceAmountMicros)
      purchase.priceAmountMicros = Number(purchase.priceAmountMicros);
    if (purchase.userCancellationTimeMillis)
      purchase.userCancellationTimeMillis = Number(
        purchase.userCancellationTimeMillis,
      );

    return purchase;
  }

  get isRegisterable(): boolean {
    const now = Date.now();
    return now <= this.expiryTimeMillis;
  }

  // These methods below are convenient utilities that developers can use to interpret Play Developer API response
  get isActive(): boolean {
    const now = Date.now();
    return now <= this.expiryTimeMillis && !this.replacedByAnotherPurchase;
  }

  get willRenew(): boolean {
    return this.autoRenewing;
  }

  get isTestPurchase(): boolean {
    return this.purchaseType === 0;
  }

  get isFreeTrial(): boolean {
    return this.paymentState === 2;
  }

  get isGracePeriod(): boolean {
    const now = Date.now();
    return (
      this.paymentState === 0 && // payment hasn't been received
      now <= this.expiryTimeMillis && // and the subscription hasn't expired
      this.autoRenewing === true
    ); // and it's renewing
    // One can also check if (this.latestNotificationType === NotificationType.SUBSCRIPTION_IN_GRACE_PERIOD)
    // Either way is fine. We decide to rely on Subscriptions:get API response because it works even when realtime dev notification delivery is delayed
  }

  get isAccountHold(): boolean {
    const now = Date.now();
    return (
      now > this.expiryTimeMillis && // the subscription has expired
      this.autoRenewing === true && // but Google Play still try to renew it
      this.paymentState === 0 && // and the payment is pending
      this.verifiedAt > this.expiryTimeMillis
    ); // and we already fetch purchase details after the subscription has expired
  }

  get isPaused(): boolean {
    const now = Date.now();
    return (
      now > this.expiryTimeMillis && // the subscription has expired
      this.autoRenewing === true && // but Google Play still try to renew it
      this.paymentState === 1 && // and the payment is received
      this.verifiedAt > this.expiryTimeMillis
    ); // and we already fetch purchase details after the subscription has expired
  }

  get activeUntilDate(): Date {
    return new Date(this.expiryTimeMillis);
  }

  get transactionId() {
    return this.purchaseToken;
  }

  get lastVerifiedAt() {
    return new Date(this.verifiedAt);
  }

  get expiresAt() {
    return new Date(this.expiryTimeMillis);
  }
}
