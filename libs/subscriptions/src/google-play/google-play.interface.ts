import type { androidpublisher_v3 as androidpublisher } from 'googleapis';

// See: https://developer.android.com/google/play/billing/rtdn-reference
export interface GooglePubSubPayload {
  message: {
    attributes: { [key: string]: string };
    data: string;
    messageId: string;
  };
  subscription: string;
}

export interface GooglePlayNotification {
  version: string;
  packageName: string;
  eventTimeMillis: number;
  subscriptionNotification?: SubscriptionNotification;
  oneTimeProductNotification?: OneTimeProductNotification;
  testNotification?: TestNotification;
}

export enum NotificationType {
  SUBSCRIPTION_PURCHASED = 4,
  SUBSCRIPTION_RENEWED = 2,
  SUBSCRIPTION_RECOVERED = 1,
  SUBSCRIPTION_CANCELED = 3,
  SUBSCRIPTION_ON_HOLD = 5,
  SUBSCRIPTION_IN_GRACE_PERIOD = 6,
  SUBSCRIPTION_RESTARTED = 7,
}

export interface OneTimeProductNotification {
  version: string;
  notificationType: NotificationType;
  purchaseToken: string;
  sku: string;
}

export interface SubscriptionNotification {
  version: string;
  notificationType: NotificationType;
  purchaseToken: string;
  subscriptionId: string;
}

export interface TestNotification {
  version: string;
}

export type GooglePlayToken = {
  packageName?: string;
  productId: string;
  purchaseToken: string;
};

export type GooglePlaySubscriptionResponse = androidpublisher.Schema$SubscriptionPurchase;
