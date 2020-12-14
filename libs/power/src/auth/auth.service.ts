import { Injectable } from '@nestjs/common';
import { RegisterUserInput } from '../types';
import { User } from '../user';

@Injectable()
export class AuthService {

  public async register(input: RegisterUserInput) {
    // register with the auth provider
    // await this.auth.registerUser(input.email, input.password);
    // add to the user table

    // await User.query().insert()
    return true;
  }
}
