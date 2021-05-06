import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionUpdatedEvent } from '../event/subscription-updated.event';
import { SubscriptionModel } from '../model';
import { toSubscriptionModelData } from '../subscription.service';
import {
  GooglePlayNotification,
  NotificationType,
  SubscriptionNotification,
} from './google-play.interface';
import { GooglePlaySubscriptionProvider } from './google-play.provider';

@Injectable()
export class GooglePlayNotificationsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly provider: GooglePlaySubscriptionProvider,
  ) {}

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

    let subscription = await SubscriptionModel.query()
      .where('transaction_id', subscriptionInfo.transactionId)
      .first();

    // If the purchase token HAS changed, we need to find the linked subscription
    // and update it with the new token and data.
    if (!subscription && subscriptionInfo.linkedPurchaseToken) {
      subscription = await SubscriptionModel.query()
        .where('transaction_id', subscriptionInfo.linkedPurchaseToken)
        .first();
    }

    if (!subscription) {
      // Nothing we can do
      return;
    }

    await subscription
      .$query()
      .patch(toSubscriptionModelData(subscription.accountId, subscriptionInfo));

    await this.eventEmitter.emitAsync(
      'subscription.updated',
      new SubscriptionUpdatedEvent(subscription.accountId, subscriptionInfo),
    );
  }
}
