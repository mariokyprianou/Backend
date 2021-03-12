import { Module } from '@nestjs/common';
import { AppStoreSubscriptionModule } from './app-store/app-store.module';
import { AppStoreSubscriptionProvider } from './app-store/app-store.provider';
import { GooglePlaySubscriptionProvider } from './google-play';
import { GooglePlaySubscriptionModule } from './google-play/google-play.module';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [AppStoreSubscriptionModule, GooglePlaySubscriptionModule],
  providers: [
    {
      provide: SubscriptionService,
      inject: [AppStoreSubscriptionProvider, GooglePlaySubscriptionProvider],
      useFactory: (
        appStoreProvider: AppStoreSubscriptionProvider,
        googlePlayProvider: GooglePlaySubscriptionProvider,
      ) => {
        return new SubscriptionService([appStoreProvider, googlePlayProvider]);
      },
    },
  ],
  exports: [
    SubscriptionService,
    AppStoreSubscriptionModule,
    GooglePlaySubscriptionModule,
  ],
})
export class SubscriptionModule {}
