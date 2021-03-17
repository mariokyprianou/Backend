// import { UserModule } from '@lib/power/user';
import { ScreenshotModule, UserModule } from '@lib/power';
import { Module } from '@nestjs/common';
import {
  ScreenshotQueryResolver,
  ScreenshotUserProfileResolver,
} from './screenshot.resolver';

@Module({
  imports: [ScreenshotModule, UserModule],
  providers: [ScreenshotQueryResolver, ScreenshotUserProfileResolver],
})
export class ScreenshotAppModule {}
