import {
  SubscriptionErrorCode,
  SubscriptionPlatform,
} from './subscription.constants';

export class SubscriptionError extends Error {
  constructor(public readonly code: SubscriptionErrorCode, message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export class SubscriptionAlreadyRegisteredError extends SubscriptionError {
  constructor(
    public readonly platform: SubscriptionPlatform,
    public readonly accountId: string,
  ) {
    super(
      SubscriptionErrorCode.AlreadyRegistered,
      'Subscription is already registered against another user account.',
    );
    this.name = 'SubscriptionAlreadyRegisteredError';
  }
}
