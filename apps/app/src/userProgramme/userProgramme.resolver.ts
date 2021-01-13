import { AuthContext, WorkoutOrder } from '@lib/power/types';
import { UserPowerService } from '@lib/power/user-power';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver('UserProgramme')
export class UserProgrammeResolver {
  constructor(private userPower: UserPowerService) {}

  @Query('getProgramme')
  async userProgramme(
    @Context('authContext') authContext: AuthContext,
    @Context('language') language: string,
  ) {
    return this.userPower.currentUserProgramme(authContext.sub, language);
  }

  @Mutation('updateOrder')
  async updateOrder(
    @Context('authContext') authContext: AuthContext,
    @Args('input') input: WorkoutOrder[],
  ): Promise<boolean> {
    return this.userPower.updateOrder(input, authContext.sub);
  }
}
