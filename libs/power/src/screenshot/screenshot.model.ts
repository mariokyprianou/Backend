import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import type { Account } from '../account';

export class Screenshot extends BaseModel {
  static tableName = 'screenshot';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  accountId: string;
  takenAt: Date;

  account: Account;

  static get relationMappings() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Account } = require('../account');
    return {
      account: {
        relation: Model.BelongsToOneRelation,
        modelClass: Account,
        join: {
          from: 'screenshot.account_id',
          to: 'account.id',
        },
      },
    };
  }
}
