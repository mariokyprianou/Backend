import { Module } from '@nestjs/common';
import { AppStoreSubscriptionModule } from './app-store/app-store.module';
import { AppStoreSubscriptionProvider } from './app-store/app-store.provider';
import { GooglePlaySubscriptionProvider } from './google-play';
import { GooglePlaySubscriptionModule } from './google-play/google-play.module';
import { ManualSubscriptionModule } from './manual/manual.module';
import { ManualSubscriptionProvider } from './manual/manual.provider';
import { SubscriptionLoaders } from './subscription.loaders';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    AppStoreSubscriptionModule,
    GooglePlaySubscriptionModule,
    ManualSubscriptionModule,
  ],
  providers: [
    {
      provide: SubscriptionService,
      inject: [
        AppStoreSubscriptionProvider,
        GooglePlaySubscriptionProvider,
        ManualSubscriptionProvider,
      ],
      useFactory: (
        appStoreProvider: AppStoreSubscriptionProvider,
        googlePlayProvider: GooglePlaySubscriptionProvider,
        manualProvider: ManualSubscriptionProvider,
      ) => {
        return new SubscriptionService([
          appStoreProvider,
          googlePlayProvider,
          manualProvider,
        ]);
      },
    },
    SubscriptionLoaders,
  ],
  exports: [
    SubscriptionService,
    AppStoreSubscriptionModule,
    GooglePlaySubscriptionModule,
    SubscriptionLoaders,
  ],
})
export class SubscriptionModule {}
