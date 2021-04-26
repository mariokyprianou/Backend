import { Module } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { AppStoreSubscriptionModule } from './app-store/app-store.module';
import { AppStoreSubscriptionProvider } from './app-store/app-store.provider';
import { GooglePlaySubscriptionProvider } from './google-play';
import { GooglePlaySubscriptionModule } from './google-play/google-play.module';
import { ManualSubscriptionModule } from './manual/manual.module';
import { ManualSubscriptionProvider } from './manual/manual.provider';
import { SubscriptionUpdateHandler } from './subscription.event-handler';
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
        EventEmitter2,
        AppStoreSubscriptionProvider,
        GooglePlaySubscriptionProvider,
        ManualSubscriptionProvider,
      ],
      useFactory: (
        eventEmitter: EventEmitter2,
        appStoreProvider: AppStoreSubscriptionProvider,
        googlePlayProvider: GooglePlaySubscriptionProvider,
        manualProvider: ManualSubscriptionProvider,
      ) => {
        return new SubscriptionService(eventEmitter, [
          appStoreProvider,
          googlePlayProvider,
          manualProvider,
        ]);
      },
    },
    SubscriptionLoaders,
    SubscriptionUpdateHandler,
  ],
  exports: [
    SubscriptionService,
    AppStoreSubscriptionModule,
    GooglePlaySubscriptionModule,
    SubscriptionLoaders,
  ],
})
export class SubscriptionModule {}
