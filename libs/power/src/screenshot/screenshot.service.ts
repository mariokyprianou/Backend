import { Injectable } from '@nestjs/common';
import { Screenshot } from './screenshot.model';
import { subDays } from 'date-fns';

@Injectable()
export class ScreenshotService {
  private readonly SCREENTSHOT_WINDOW_DAYS = 30;

  public async getScreenshotsTaken(accountId: string): Promise<number> {
    const cutoffTime = subDays(new Date(), this.SCREENTSHOT_WINDOW_DAYS);
    const screenshotsTaken = await Screenshot.query()
      .where('account_id', accountId)
      .andWhere('taken_at', '>=', cutoffTime)
      .resultSize();

    return screenshotsTaken;
  }

  public async screenshotTaken(accountId: string): Promise<number> {
    await Screenshot.query().insert({ accountId }).returning('*');
    return this.getScreenshotsTaken(accountId);
  }
}
