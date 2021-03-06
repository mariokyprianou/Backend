export enum SubscriptionPlanSku {
  MANUAL = 'app.power.subscription.manual',
  LIFETIME = 'app.power.subscription.lifetime',
  YEARLY = 'app.power.subscription.yearly',
  MONTHLY = 'app.power.subscription.monthly',
}

export enum SubscriptionPlatform {
  GooglePlay = 'GOOGLE_PLAY',
  AppStore = 'APP_STORE',
  ManualOverride = 'MANUAL_OVERRIDE',
}

export enum SubscriptionErrorCode {
  AlreadyRegistered = 'ALREADY_REGISTERED',
}
