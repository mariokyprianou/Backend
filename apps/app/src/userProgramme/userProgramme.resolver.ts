import { AuthContext } from '@lib/power/types';
import { UserPowerService } from '@lib/power/user-power';
import { Context, Query, Resolver } from '@nestjs/graphql';

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
}
