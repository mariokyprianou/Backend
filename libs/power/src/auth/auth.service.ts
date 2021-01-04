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
    const user = await this.userService.create(input, res.UserSub);
    // add to the account table
    // add two weeks worth of workouts
    await this.accountService.create(input.programme, res.UserSub, user.id);

    return true;
  }

  public async sendVerification(username: string) {
    const res = await this.authProvider.resendEmailVerificationLink(username);
    return res;
  }

  public async delete(id: string) {
    const user = await this.userService.delete(id);
    await this.accountService.delete(id);
    await this.authProvider.delete(user.cognitoSub);
    return user;
  }

  public async login(email: string, password: string) {
    const authResult = await this.authProvider.login(email, password);
    return {
      accessToken: authResult.AuthenticationResult.AccessToken,
      refreshToken: authResult.AuthenticationResult.RefreshToken,
      expires: authResult.AuthenticationResult.ExpiresIn,
    };
  }
}
