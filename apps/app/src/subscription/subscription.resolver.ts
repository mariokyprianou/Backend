import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionService, SubscriptionPlatform } from '@td/subscriptions';
import { User } from '../context';
import { RegisterAppStoreSubscriptionDto } from './register-app-store-subscription.dto copy';
import { RegisterGooglePlaySubscriptionDto } from './register-google-play-subscription.dto';

@Resolver('Subscription')
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Query('subscription')
  async getSubscription(@User() user: User) {
    const subscription = await this.subscriptionService.findActiveSubscription(
      user.id,
    );
    return subscription;
  }

  @Mutation('registerGooglePlaySubscription')
  async registerGooglePlaySubscription(
    @User() user: User,
    @Args('input') input: RegisterGooglePlaySubscriptionDto,
  ) {
    try {
      const subscription = await this.subscriptionService.registerSubscription({
        platform: SubscriptionPlatform.GooglePlay,
        accountId: user.id,
        providerToken: input,
      });
      return { success: true, subscription };
    } catch (error) {
      console.log(
        'registerSubscription',
        'error',
        JSON.stringify({ accountId: user.id, input }),
        error,
      );
      return { success: false };
    }
  }

  @Mutation('registerAppStoreSubscription')
  async registerAppStoreSubscription(
    @User() user: User,
    @Args('input') input: RegisterAppStoreSubscriptionDto,
  ) {
    try {
      const subscription = await this.subscriptionService.registerSubscription({
        platform: SubscriptionPlatform.AppStore,
        accountId: user.id,
        providerToken: { receipt: input.receiptData },
      });
      return { success: true, subscription };
    } catch (error) {
      console.log(
        'registerSubscription',
        'error',
        JSON.stringify({ accountId: user.id, input }),
        error,
      );
      return { success: false };
    }
  }
}
