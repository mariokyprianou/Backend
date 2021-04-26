import { User } from '@lib/power';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscriptionUpdatedEvent } from './event/subscription-updated.event';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionUpdateHandler {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @OnEvent('subscription.updated')
  public async onSubscriptionUpdate(event: SubscriptionUpdatedEvent) {
    const subscription = await this.subscriptionService.findActiveSubscription(
      event.accountId,
    );

    if (subscription) {
      await User.query().findById(event.accountId).patch({
        subscriptionPlatform: subscription.provider,
        subscriptionExpiresAt: subscription.expiresAt,
      });
    }
  }
}
