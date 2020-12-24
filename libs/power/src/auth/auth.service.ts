import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';
import { AccountService } from '../account';
import { RegisterUserInput } from '../types';
import { UserService } from '../user';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER') private authProvider: AuthProviderService,
    private accountService: AccountService,
    private userService: UserService,
  ) {}

  public async register(input: RegisterUserInput) {
    // register with the auth provider
    const res = await this.authProvider.registerWithEmailVerificationLink(
      input.email,
      input.password,
      {},
    );
    // add to the user table
    await this.userService.create(input, res.UserSub);
    // add to the account table
    // add two weeks worth of workouts
    // await this.accountService.create(input.programme, res.UserSub);
    await this.accountService.create(
      input.programme,
      '5045d36f-38a5-4d4c-bdd0-a8403b44f21e',
    );

    return true;
  }

  public async sendVerification(username: string) {
    const res = await this.authProvider.resendEmailVerificationLink(username);
    return res;
  }
}
