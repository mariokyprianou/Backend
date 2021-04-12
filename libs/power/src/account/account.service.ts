import { Injectable } from '@nestjs/common';
import { Account } from './account.model';
import { UserPreference } from '../types';

@Injectable()
export class AccountService {
  public findAll() {
    return Account.query();
  }

  public findById(id: string) {
    return Account.query().findById(id);
  }

  public findBySub(sub: string) {
    return Account.query().findOne('cognito_username', sub);
  }

  public delete(id: string) {
    // Note: leave the user training program un-deleted
    return Account.query().findById(id).delete();
  }

  public async updatePreference(input: UserPreference, sub: string) {
    const account = await this.findBySub(sub);
    return account.$query().patchAndFetch(input);
  }
}
