import { registerAs } from '@nestjs/config';
import * as envalid from 'envalid';
import { SubscriptionPlanSku } from '../subscription.constants';

export const googlePlaySubscriptionConfig = registerAs(
  'subscriptions.googlePlay',
  () => {
    const env = envalid.cleanEnv(process.env, {
      SUBSCRIPTION_SKU: envalid.str({ default: 'subscription' }),
      GOOGLE_PLAY_PACKAGE_NAME: envalid.str(),
      GOOGLE_PLAY_SERVICE_ACCOUNT_CLIENT_EMAIL: envalid.email(),
      GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY: envalid.str(),
    });

    return {
      packageName: env.GOOGLE_PLAY_PACKAGE_NAME,
      subscription: {
        sku: env.SUBSCRIPTION_SKU,
        productIds: [SubscriptionPlanSku.YEARLY, SubscriptionPlanSku.MONTHLY],
      },

      credentials: {
        clientEmail: env.GOOGLE_PLAY_SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: env.GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY,
      },
    };
  },
);
