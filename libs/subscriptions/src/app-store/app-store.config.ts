import * as envalid from 'envalid';
import { registerAs } from '@nestjs/config';

export const appStoreSubscriptionConfig = registerAs(
  'subscriptions.appStore',
  () => {
    const env = envalid.cleanEnv(process.env, {
      SUBSCRIPTION_SKU: envalid.str({ default: 'subscription' }),
      APP_STORE_SHARED_SECRET: envalid.str(),
      APP_STORE_MONTHLY_SUBSCRIPTION_PRODUCT_ID: envalid.str(),
      APP_STORE_YEARLY_SUBSCRIPTION_PRODUCT_ID: envalid.str(),
    });

    return {
      sharedSecret: env.APP_STORE_SHARED_SECRET,
      subscription: {
        sku: env.SUBSCRIPTION_SKU,
        productIds: [
          env.APP_STORE_MONTHLY_SUBSCRIPTION_PRODUCT_ID,
          env.APP_STORE_YEARLY_SUBSCRIPTION_PRODUCT_ID,
        ],
      },
    };
  },
);
