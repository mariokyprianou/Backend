import {
  UserProfile,
  AuthContext,
  UserPreference,
  UserProfileInput,
  ChangeDevice,
} from '@lib/power/types';
import { AuthService } from '@lib/power/auth';
import { Query, Context, Mutation, Resolver, Args } from '@nestjs/graphql';

@Resolver('UserProfile')
export class ProfileResolver {
  constructor(private user: AuthService) {}

  @Mutation('ping')
  ping(): string {
    return 'Pong!';
  }

  @Query('profile')
  async profile(
    @Context('authContext') authContext: AuthContext,
  ): Promise<UserProfile> {
    return this.user.profile(authContext);
  }

  @Query('preferences')
  async preferences(
    @Context('authContext') authContext: AuthContext,
  ): Promise<UserPreference> {
    return this.user.preference(authContext);
  }

  @Mutation('updateProfile')
  async updateProfile(
    @Args('input') input: UserProfileInput,
    @Context('authContext') authContext: AuthContext,
  ): Promise<UserProfile> {
    return this.user.updateProfile(input, authContext);
  }

  @Mutation('updatePreference')
  async updatePreference(
    @Args('input') input: UserPreference,
    @Context('authContext') authContext: AuthContext,
  ): Promise<UserPreference> {
    return this.user.updatePreference(input, authContext);
  }

  @Mutation('changeDevice')
  async changeDevice(
    @Args('input') input: ChangeDevice,
    @Context('authContext') authContext: AuthContext,
  ): Promise<boolean> {
    return this.user.changeDevice(input, authContext);
  }
}
