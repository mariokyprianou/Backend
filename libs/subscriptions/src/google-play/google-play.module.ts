import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GooglePlayNotificationsService } from './google-play-notifications.service';
import {
  GooglePlayProviderCtorParams,
  GooglePlaySubscriptionProvider,
} from './google-play.provider';

@Module({
  providers: [
    {
      provide: GooglePlaySubscriptionProvider,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const params = configService.get<GooglePlayProviderCtorParams>(
          'subscriptions.googlePlay',
        );
        return new GooglePlaySubscriptionProvider(params);
      },
    },
    GooglePlayNotificationsService,
  ],
  exports: [GooglePlaySubscriptionProvider, GooglePlayNotificationsService],
})
export class GooglePlaySubscriptionModule {}
