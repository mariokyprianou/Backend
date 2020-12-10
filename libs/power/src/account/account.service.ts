import { UserModel } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { Account } from './account.model';

@Injectable()
export class AccountService {
  public findAll() {
    return Account.query();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public delete(id: string) {
    // Note: leave the user training program un-deleted
    return Account.query().findById(id).delete();
  }
}
