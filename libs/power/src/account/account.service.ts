import { UserModel } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { Account } from './account.model';

@Injectable()
export class AccountService {
  public async findAll() {
    return await Account.query();
  }
}
