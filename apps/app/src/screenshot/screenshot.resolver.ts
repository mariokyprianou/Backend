import { ScreenshotService, UserService } from '@lib/power';
import { AuthContext } from '@lib/power/types';
import { Context, Mutation, Resolver, ResolveField } from '@nestjs/graphql';

interface ScreenshotTakenResponse {
  success: boolean;
  screenshotsTaken?: number;
}

@Resolver()
export class ScreenshotQueryResolver {
  constructor(
    private userService: UserService,
    private screenshotService: ScreenshotService,
  ) {}

  @Mutation('screenshotTaken')
  async screenshotTaken(
    @Context('authContext') authContext: AuthContext,
  ): Promise<ScreenshotTakenResponse> {
    const user = await this.userService.findBySub(authContext.sub);
    const screenshotsTaken = await this.screenshotService.screenshotTaken(
      user.id,
    );
    return {
      success: true,
      screenshotsTaken,
    };
  }
}

@Resolver('UserProfile')
export class ScreenshotUserProfileResolver {
  constructor(
    private userService: UserService,
    private screenshotService: ScreenshotService,
  ) {}

  @ResolveField('screenshotsTaken')
  async getScreenshotsTaken(@Context('authContext') authContext: AuthContext) {
    const user = await this.userService.findBySub(authContext.sub);
    return this.screenshotService.getScreenshotsTaken(user.id);
  }
}
