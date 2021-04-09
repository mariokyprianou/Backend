import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { Account } from './account.model';

@Injectable({ scope: Scope.REQUEST })
export class AccountLoaders {
  public readonly findById = new DataLoader<string, Account>(
    async (accountIds) => {
      const accounts = await Account.query().findByIds(accountIds as string[]);

      return accountIds.map((accountId) =>
        accounts.find((account) => account.id === accountId),
      );
    },
  );
}
