import { ScreenshotService } from '@lib/power/screenshot';
import { UserService } from '@lib/power/user';
import { Mutation, Resolver, ResolveField } from '@nestjs/graphql';
import { User } from '../context';

interface ScreenshotTakenResponse {
  success: boolean;
  screenshotsTaken?: number;
}

@Resolver()
export class ScreenshotQueryResolver {
  constructor(private screenshotService: ScreenshotService) {}

  @Mutation('screenshotTaken')
  async screenshotTaken(@User() user: User): Promise<ScreenshotTakenResponse> {
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
  async getScreenshotsTaken(@User() user: User) {
    return this.screenshotService.getScreenshotsTaken(user.id);
  }
}
