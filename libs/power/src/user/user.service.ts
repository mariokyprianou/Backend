import { UserModel } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { User } from './user.model';

@Injectable()
export class UserService {
  // Get users
  public async findAll() {
    return User.query().select('*');
  }
}
