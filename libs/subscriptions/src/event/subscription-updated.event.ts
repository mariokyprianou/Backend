import { Subscription } from '../subscription.interface';

export class SubscriptionUpdatedEvent {
  constructor(
    public readonly accountId: string,
    public readonly subscription: Subscription,
  ) {}
}
