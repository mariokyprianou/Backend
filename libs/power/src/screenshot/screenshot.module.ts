import { Module } from '@nestjs/common';
import { ScreenshotLoaders } from './screenshot.loaders';
import { ScreenshotService } from './screenshot.service';

@Module({
  providers: [ScreenshotService, ScreenshotLoaders],
  exports: [ScreenshotService, ScreenshotLoaders],
})
export class ScreenshotModule {}
