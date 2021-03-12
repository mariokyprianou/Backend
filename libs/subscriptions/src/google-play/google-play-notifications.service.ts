import { Injectable } from '@nestjs/common';
import { Subscription } from '@nestjs/graphql';
import { SubscriptionModel } from '../model';
import { toSubscriptionModelData } from '../subscription.service';
import {
  GooglePlayNotification,
  GooglePlayToken,
  NotificationType,
  SubscriptionNotification,
} from './google-play.interface';
import { GooglePlaySubscriptionProvider } from './google-play.provider';

@Injectable()
export class GooglePlayNotificationsService {
  constructor(private readonly provider: GooglePlaySubscriptionProvider) {}

  async handleRealtimeNotification(notification: GooglePlayNotification) {
    if (notification.testNotification) {
      console.log(
        'GooglePlay',
        'Test notification received',
        JSON.stringify(notification),
      );

      return;
    }

    if (notification.oneTimeProductNotification) {
      console.log(
        'GooglePlay',
        'One-Time purchase notification received',
        JSON.stringify(notification),
      );

      return;
    }

    if (notification.subscriptionNotification) {
      console.log(
        'GooglePlay',
        'Subscription notification received',
        JSON.stringify(notification),
      );

      await this.handleSubscriptionNotification(
        notification.subscriptionNotification,
      );
      return;
    }
  }

  private async handleSubscriptionNotification(
    notification: SubscriptionNotification,
  ) {
    if (
      notification.notificationType === NotificationType.SUBSCRIPTION_PURCHASED
    ) {
      // Ignore notifications for new subs - we rely on the app to register these
      // in order to link with the correct user
      return;
    }

    const subscriptionInfo = await this.provider.getSubscriptionInfo({
      productId: notification.subscriptionId,
      purchaseToken: notification.purchaseToken,
    });

    if (!subscriptionInfo) {
      return;
    }

    const subscription = await SubscriptionModel.query()
      .where('transaction_id', subscriptionInfo.transactionId)
      .first();

    // If the purchase token hasn't changed then we can simply update with the new info
    if (subscription) {
      await subscription
        .$query()
        .patch(
          toSubscriptionModelData(subscription.accountId, subscriptionInfo),
        );
      return;
    }

    // If the purchase token HAS changed, we need to find the linked subscription
    // and update it with the new token and data.
    if (subscriptionInfo.linkedPurchaseToken) {
      const subscription = await SubscriptionModel.query()
        .where('transaction_id', subscriptionInfo.linkedPurchaseToken)
        .first();
      if (!subscription) {
        return;
      }

      await subscription
        .$query()
        .patch(
          toSubscriptionModelData(subscription.accountId, subscriptionInfo),
        );
    }
  }
}
