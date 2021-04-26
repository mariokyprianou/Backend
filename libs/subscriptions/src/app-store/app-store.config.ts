import * as envalid from 'envalid';
import { registerAs } from '@nestjs/config';
import { SubscriptionPlanSku } from '../subscription.constants';

export const appStoreSubscriptionConfig = registerAs(
  'subscriptions.appStore',
  () => {
    const env = envalid.cleanEnv(process.env, {
      SUBSCRIPTION_SKU: envalid.str({ default: 'subscription' }),
      APP_STORE_SHARED_SECRET: envalid.str(),
    });

    return {
      sharedSecret: env.APP_STORE_SHARED_SECRET,
      subscription: {
        sku: env.SUBSCRIPTION_SKU,
        productIds: [SubscriptionPlanSku.YEARLY, SubscriptionPlanSku.MONTHLY],
      },
    };
  },
);
