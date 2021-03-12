import { FactoryProvider, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppStoreClient } from './app-store.client';
import { AppStoreSubscriptionProvider } from './app-store.provider';

const appStoreSubscriptionProvider: FactoryProvider<AppStoreSubscriptionProvider> = {
  provide: AppStoreSubscriptionProvider,
  inject: [AppStoreClient, ConfigService],
  useFactory: (client: AppStoreClient, configService: ConfigService) => {
    const params = configService.get('subscriptions.appStore.subscription');
    return new AppStoreSubscriptionProvider(client, params);
  },
};

const appStoreClientProvider: FactoryProvider<AppStoreClient> = {
  provide: AppStoreClient,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new AppStoreClient(
      configService.get('subscriptions.appStore.sharedSecret'),
    );
  },
};

@Module({
  providers: [appStoreClientProvider, appStoreSubscriptionProvider],
  exports: [AppStoreSubscriptionProvider],
})
export class AppStoreSubscriptionModule {}
