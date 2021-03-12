export enum SubscriptionErrorCode {
  UnknownError = 'UnknownError',
  InvalidToken = 'InvalidToken',
}

export class SubscriptionError extends Error {
  constructor(
    message: string,
    public code: SubscriptionErrorCode = SubscriptionErrorCode.UnknownError,
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}
