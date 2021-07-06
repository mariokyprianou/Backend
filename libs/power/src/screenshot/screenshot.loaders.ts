import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { ScreenshotService } from './screenshot.service';

@Injectable({ scope: Scope.REQUEST })
export class ScreenshotLoaders {
  constructor(private readonly screenshotService: ScreenshotService) {}

  public screenshotsByAccountId = new DataLoader<string, number>(
    (accountIds: string[]) => {
      return this.screenshotService.getScreenshotsTaken(accountIds);
    },
  );
}
