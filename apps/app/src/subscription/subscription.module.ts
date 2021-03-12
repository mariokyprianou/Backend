import { Module } from '@nestjs/common';
import { SubscriptionModule } from '@td/subscriptions';
import { SubscriptionResolver } from './subscription.resolver';

@Module({
  imports: [SubscriptionModule],
  providers: [SubscriptionResolver],
})
export class SubscriptionAppModule {}
