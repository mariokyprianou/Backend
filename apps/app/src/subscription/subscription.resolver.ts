import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  SubscriptionService,
  SubscriptionPlatform,
  SubscriptionAlreadyRegisteredError,
} from '@td/subscriptions';
import { User } from '../context';
import { RegisterAppStoreSubscriptionDto } from './register-app-store-subscription.dto';
import { RegisterGooglePlaySubscriptionDto } from './register-google-play-subscription.dto';

function convertError(error): { path: string; message: string } {
  if (error instanceof SubscriptionAlreadyRegisteredError) {
    return {
      message: error.message,
      path: 'input',
    };
  }

  return {
    path: '',
    message: 'An unknown error occurred.',
  };
}

@Resolver('Subscription')
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Query('subscription')
  async getSubscription(@User() user: User) {
    const subscription = await this.subscriptionService.findActiveSubscription(
      user.id,
    );

    if (!subscription) {
      return { active: false };
    }

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
      return { success: true, userErrors: [], subscription };
    } catch (error) {
      console.log(
        'registerSubscription',
        'error',
        JSON.stringify({ accountId: user.id, input }),
        error,
      );
      return { success: false, userErrors: [convertError(error)] };
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
      return { success: true, userErrors: [], subscription };
    } catch (error) {
      console.log(
        'registerSubscription',
        'error',
        JSON.stringify({ accountId: user.id, input }),
        error,
      );
      return { success: false, userErrors: [convertError(error)] };
    }
  }
}
