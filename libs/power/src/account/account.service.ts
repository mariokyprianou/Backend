import { Injectable } from '@nestjs/common';
import { raw } from 'objection';
import { Account } from './account.model';
import { UserPreference } from '../types';

@Injectable()
export class AccountService {
  public findAll() {
    return Account.query().whereNull('deleted_at');
  }

  public findById(id: string) {
    return Account.query().whereNull('deleted_at').findById(id);
  }

  public findBySub(sub: string) {
    return Account.query()
      .whereNull('deleted_at')
      .findOne('cognito_username', sub);
  }

  public delete(id: string): Promise<Account> {
    return Account.query()
      .findById(id)
      .whereNull('deleted_at')
      .patch({ deletedAt: raw('NOW()') })
      .returning('*')
      .first();
  }

  public async updatePreference(input: UserPreference, sub: string) {
    const account = await this.findBySub(sub);
    return account.$query().patchAndFetch(input);
  }
}
