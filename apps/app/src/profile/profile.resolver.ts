import {
  AuthService,
  UserProfile,
  AuthContext,
  UserPreference,
  UserProfileInput,
  ChangeDevice,
} from '@lib/power';
import { AccountLoaders } from '@lib/power/account/account.loaders';
import {
  Query,
  Context,
  Mutation,
  Resolver,
  Args,
  ResolveField,
} from '@nestjs/graphql';
import { User } from '../context';

@Resolver('UserProfile')
export class ProfileResolver {
  constructor(
    private readonly accountLoaders: AccountLoaders,
    private readonly authService: AuthService,
  ) {}

  @ResolveField('completedWorkouts')
  async getCompletedWorkouts(@User() user: User) {
    const account = await this.accountLoaders.findById.load(user.id);
    return account.workoutsCompleted;
  }

  @Mutation('ping')
  ping(): string {
    return 'Pong!';
  }

  @Query('profile')
  async profile(@User() user: User): Promise<UserProfile> {
    return this.authService.profile(user.id);
  }

  @Query('preferences')
  async preferences(@User() user: User): Promise<UserPreference> {
    return this.authService.preference(user.id);
  }

  @Mutation('updateProfile')
  async updateProfile(
    @Args('input') input: UserProfileInput,
    @Context('authContext') authContext: AuthContext,
  ): Promise<UserProfile> {
    return this.authService.updateProfile(input, authContext);
  }

  @Mutation('updatePreference')
  async updatePreference(
    @Args('input') input: UserPreference,
    @User() user: User,
  ): Promise<UserPreference> {
    return this.authService.updateUserPreferences(user.id, input);
  }

  @Mutation('changeDevice')
  async changeDevice(
    @Args('input') input: ChangeDevice,
    @Context('authContext') authContext: AuthContext,
  ): Promise<boolean> {
    return this.authService.changeDevice(input, authContext);
  }

  @Mutation('updateEmail')
  async updateEmail(
    @Args('email') email: string,
    @Context('authContext') authContext: AuthContext,
  ): Promise<boolean> {
    return this.authService.updateEmail(email, authContext);
  }
}
