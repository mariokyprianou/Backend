import { Inject, Injectable } from '@nestjs/common';
import { Screenshot } from './screenshot.model';
import { subDays } from 'date-fns';
import { POWER_DB } from '@lib/database';
import Knex from 'knex';
import { raw } from 'objection';
import { SCREENSHOT_WINDOW_DAYS } from './screenshot.constant';

@Injectable()
export class ScreenshotService {
  constructor(@Inject(POWER_DB) private readonly db: Knex) {}

  public async getScreenshotsTaken(accountId: string): Promise<number>;
  public async getScreenshotsTaken(accountIds: string[]): Promise<number[]>;
  public async getScreenshotsTaken(
    accountIdOrIds: string | string[],
  ): Promise<number | number[]> {
    const cutoffTime = subDays(new Date(), SCREENSHOT_WINDOW_DAYS);
    const accountIds = Array.isArray(accountIdOrIds)
      ? accountIdOrIds
      : [accountIdOrIds];

    const screenshots = await Screenshot.query()
      .select('account_id as accountId', raw('SUM(1) as screenshots'))
      .whereIn('account_id', accountIds)
      .andWhere('taken_at', '>=', cutoffTime)
      .groupBy('account_id')
      .toKnexQuery<{ accountId: string; screenshots: number }>();

    const screenshotCounts = accountIds.map((id) => {
      const result = screenshots.find((ss) => ss.accountId === id);
      return result ? result.screenshots : 0;
    });

    return Array.isArray(accountIdOrIds)
      ? screenshotCounts
      : screenshotCounts[0];
  }

  public async screenshotTaken(accountId: string): Promise<number> {
    await Screenshot.query().insert({ accountId }).returning('*');
    return this.getScreenshotsTaken(accountId);
  }

  public async clearScreenshots(accountId: string): Promise<number> {
    return await Screenshot.query().where('account_id', accountId).del();
  }
}
