import { Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver('Subscription')
export class SubscriptionResolver {
  @Query('subscription')
  async getSubscription() {
    return {
      isActive: true,
    };
  }

  @Mutation('registerGooglePlaySubscription')
  async registerGooglePlaySubscription() {
    return { success: false };
  }

  @Mutation('registerAppStoreSubscription')
  async registerAppStoreSubscription() {
    return { success: false };
  }
}
