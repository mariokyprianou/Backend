/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Thu, 17th December 202020
 * Copyright 2020 - The Distance
 */
import { commonConfig } from '@lib/common';
import { databaseConfig, DatabaseModule } from '@lib/database';
import {
  appStoreSubscriptionConfig,
  googlePlaySubscriptionConfig,
  SubscriptionModule,
} from '@td/subscriptions';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        commonConfig,
        databaseConfig,
        appStoreSubscriptionConfig,
        googlePlaySubscriptionConfig,
      ],
    }),
    DatabaseModule,
    SubscriptionModule,
  ],
})
export class WebhookProcessingModule {}
