import { AbstractSubscription, Subscription } from '../subscription.interface';
import { APP_STORE_PROVIDER_NAME } from './app-store.constants';
import {
  VerifyReceiptSuccessResponse,
  ExpirationIntent,
  AppStoreToken,
  AppStoreEnvironment,
  LatestReceiptInfo,
} from './app-store.interface';

export class AppStoreSubscription
  extends AbstractSubscription<AppStoreToken, VerifyReceiptSuccessResponse>
  implements Subscription {
  constructor(token: AppStoreToken, response: VerifyReceiptSuccessResponse) {
    super(APP_STORE_PROVIDER_NAME, token, response);
  }
  verificationDate: Date;

  // Receipt fields
  environment: AppStoreEnvironment;
  latestReceipt: string;

  // Subscription fields
  quantity: string;
  productId: string;
  transactionId: string;
  originalTransactionId: string;
  purchaseDate: Date;
  originalPurchaseDate: Date;
  expiresDate: Date;
  webOrderLineItemId: string;
  isTrialPeriod: boolean;
  isInIntroOfferPeriod: boolean;
  inAppOwnershipType: string;
  subscriptionGroupIdentifier: string;

  // Renewal fields
  autoRenewProductId?: string;
  autoRenewStatus: boolean;
  expirationIntent?: ExpirationIntent;
  gracePeriodExpiresDate?: Date;
  isInBillingRetryPeriod?: boolean;
  offerCodeRefName: string;
  priceConsentStatus: boolean;
  promotionalOfferId: string;

  static fromApiResponse(
    response: VerifyReceiptSuccessResponse,
    productIds: string[],
    transactionId?: string,
  ): AppStoreSubscription {
    let subscriptionInfo: LatestReceiptInfo;
    if (transactionId) {
      subscriptionInfo = (response.latest_receipt_info ?? []).find(
        (info) => info.original_transaction_id === transactionId,
      );
    }

    if (!subscriptionInfo) {
      subscriptionInfo = (response.latest_receipt_info ?? []).find((info) =>
        productIds.includes(info.product_id),
      );
    }

    if (!subscriptionInfo) {
      return null;
    }

    const renewalInfo = (response.pending_renewal_info ?? []).find(
      (info) =>
        (info.original_transaction_id =
          subscriptionInfo.original_transaction_id),
    );

    const subscription = new AppStoreSubscription(
      { receipt: response.latest_receipt },
      response,
    );
    subscription.environment = response.environment;
    subscription.latestReceipt = response.latest_receipt;
    subscription.verificationDate = new Date(
      Number(response.receipt.request_date_ms),
    );

    subscription.quantity = subscriptionInfo.quantity;
    subscription.productId = subscriptionInfo.product_id;
    subscription.transactionId = subscriptionInfo.transaction_id;
    subscription.originalTransactionId =
      subscriptionInfo.original_transaction_id;

    subscription.purchaseDate = new Date(
      Number(subscriptionInfo.purchase_date_ms),
    );
    subscription.originalPurchaseDate = new Date(
      Number(subscriptionInfo.original_purchase_date_ms),
    );
    subscription.expiresDate = new Date(
      Number(subscriptionInfo.expires_date_ms),
    );

    subscription.webOrderLineItemId = subscriptionInfo.web_order_line_item_id;
    subscription.isTrialPeriod = JSON.parse(subscriptionInfo.is_trial_period);
    subscription.isInIntroOfferPeriod = JSON.parse(
      subscriptionInfo.is_in_intro_offer_period,
    );
    subscription.inAppOwnershipType = subscriptionInfo.in_app_ownership_type;
    subscription.subscriptionGroupIdentifier =
      subscriptionInfo.subscription_group_identifier;

    if (renewalInfo) {
      subscription.autoRenewProductId = renewalInfo.auto_renew_product_id;
      if (subscription.autoRenewStatus) {
        subscription.autoRenewStatus = renewalInfo.auto_renew_status === '1';
      }
      subscription.expirationIntent = renewalInfo.expiration_intent;

      if (renewalInfo.grace_period_expires_date_ms) {
        subscription.gracePeriodExpiresDate = new Date(
          Number(renewalInfo.grace_period_expires_date_ms),
        );
      }

      if (renewalInfo.is_in_billing_retry_period) {
        subscription.isInBillingRetryPeriod =
          renewalInfo.is_in_billing_retry_period === '1';
      }

      if (renewalInfo.offer_code_ref_name) {
        subscription.offerCodeRefName = renewalInfo.offer_code_ref_name;
      }

      if (renewalInfo.price_consent_status) {
        subscription.priceConsentStatus =
          renewalInfo.price_consent_status === '1';
      }

      if (renewalInfo.promotional_offer_id) {
        subscription.promotionalOfferId = renewalInfo.promotional_offer_id;
      }
    }

    return subscription;
  }

  get isActive(): boolean {
    const now = new Date();
    if (now < this.expiresDate) {
      return true;
    }

    if (this.gracePeriodExpiresDate && now < this.gracePeriodExpiresDate) {
      return true;
    }

    return false;
  }

  get sku() {
    return this.productId;
  }

  get expiresAt() {
    return this.expiresDate;
  }

  get lastVerifiedAt() {
    return this.verificationDate;
  }

  /**
   * @param maxAge the cutoff duration, in seconds. Defaults to 1 day
   */
  isStale(maxAge = 60 * 60 * 24) {
    const now = new Date().getTime();
    const verifiedAt = this.lastVerifiedAt.getTime();
    return now - verifiedAt > maxAge * 1000;
  }
}
