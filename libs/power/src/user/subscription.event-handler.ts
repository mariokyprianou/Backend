import { User } from '@lib/power';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  SubscriptionService,
  SubscriptionUpdatedEvent,
} from '@td/subscriptions';

@Injectable()
export class SubscriptionUpdateHandler {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @OnEvent('subscription.updated')
  public async onSubscriptionUpdate(event: SubscriptionUpdatedEvent) {
    const subscription = await this.subscriptionService.findActiveSubscription(
      event.accountId,
      { preventUpdate: true },
    );

    if (subscription) {
      await User.query().findById(event.accountId).patch({
        subscriptionPlatform: subscription.provider,
        subscriptionExpiresAt: subscription.expiresAt,
      });
    }
  }
}
