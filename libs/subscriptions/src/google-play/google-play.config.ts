import { registerAs } from '@nestjs/config';
import * as envalid from 'envalid';

export const googlePlaySubscriptionConfig = registerAs(
  'subscriptions.googlePlay',
  () => {
    const env = envalid.cleanEnv(process.env, {
      SUBSCRIPTION_SKU: envalid.str({ default: 'subscription' }),
      GOOGLE_PLAY_PACKAGE_NAME: envalid.str(),
      GOOGLE_PLAY_SERVICE_ACCOUNT_CLIENT_EMAIL: envalid.email(),
      GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY: envalid.str(),
      GOOGLE_PLAY_MONTHLY_SUBSCRIPTION_PRODUCT_ID: envalid.str(),
      GOOGLE_PLAY_YEARLY_SUBSCRIPTION_PRODUCT_ID: envalid.str(),
    });

    return {
      packageName: env.GOOGLE_PLAY_PACKAGE_NAME,
      subscription: {
        sku: env.SUBSCRIPTION_SKU,
        productIds: [
          env.GOOGLE_PLAY_MONTHLY_SUBSCRIPTION_PRODUCT_ID,
          env.GOOGLE_PLAY_YEARLY_SUBSCRIPTION_PRODUCT_ID,
        ],
      },

      credentials: {
        clientEmail: env.GOOGLE_PLAY_SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: env.GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY,
      },
    };
  },
);
