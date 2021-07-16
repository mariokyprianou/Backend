import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';
import { isAfter } from 'date-fns';
import * as uuid from 'uuid';
import { GraphQLError } from 'graphql';
import { Account, AccountService } from '../account';
import { Programme } from '../programme';
import {
  AuthContext,
  ChangeDevice,
  RegisterUserInput,
  UserPreference,
  UserProfileInput,
} from '../types';
import { User, UserService } from '../user';
import { UserPowerService } from '../user-power';
import { USER_AUTH_PROVIDER } from '../administrator';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_AUTH_PROVIDER) private authProvider: AuthProviderService,
    private accountService: AccountService,
    private userService: UserService,
    private userPowerService: UserPowerService,
  ) {}

  public async register(input: RegisterUserInput): Promise<boolean> {
    const programme = await Programme.query().findById(input.programme);
    if (!programme) {
      throw new GraphQLError('Programme does not exist.');
    }

    // register with the auth provider
    const cognitoSub = await this.authProvider.registerWithEmailVerificationLink(
      input.email,
      input.password,
    );

    // add to the user table
    const user = await this.userService.create(input, cognitoSub);

    const transaction = await Account.startTransaction();
    try {
      await transaction.raw('SET CONSTRAINTS ALL DEFERRED');
      const userTrainingProgrammeId = uuid.v4();

      // Create the account
      const account = await Account.query(transaction)
        .insert({
          id: user.id,
          cognitoUsername: cognitoSub,
          userTrainingProgrammeId,
        })
        .returning('*');

      await this.userPowerService.setUserProgramme(
        {
          accountId: account.id,
          trainingProgrammeId: input.programme,
          weekNumber: 1,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (e) {
      await Promise.all([
        transaction.rollback(),
        this.userService.delete(user.id),
        this.authProvider.delete(input.email),
      ]);
      throw e;
    }

    return true;
  }

  public async sendVerification(username: string) {
    const res = await this.authProvider.resendEmailVerificationLink(username);
    return res;
  }

  public async delete(accountId: string) {
    const user = await this.userService.delete(accountId);
    const account = await this.accountService.delete(accountId);
    await this.authProvider.delete(account.cognitoUsername);
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

  public async profile(userId: string) {
    const profile = await this.userService.findById(userId);
    return generateProfile(profile);
  }

  public async preference(accountId: string) {
    return this.accountService.findById(accountId);
  }

  public async updateProfile(
    input: UserProfileInput,
    authContext: AuthContext,
  ) {
    // Update User
    // Return User
    const profile = await this.userService.update(input, authContext.sub);
    return generateProfile(profile);
  }

  public async updateUserPreferences(
    accountId: string,
    params: UserPreference,
  ): Promise<UserPreference> {
    const [account] = await Promise.all([
      Account.query().findById(accountId).patch(params).returning('*').first(),
      User.query().findById(accountId).patch({
        allowAnalytics: params.analytics,
        allowEmailMarketing: params.emails,
        allowErrorReports: params.errorReports,
        allowNotifications: params.notifications,
      }),
    ]);

    return account;
  }

  public async changeDevice(input: ChangeDevice, authContext: AuthContext) {
    return this.userService.updateDevice(input, authContext.sub);
  }

  public async updateEmail(email: string, authContext: AuthContext) {
    // update cognito
    // update user
    try {
      await this.authProvider.updateAttributes(authContext.sub, [
        {
          Name: 'email',
          Value: email,
        },
      ]);
      await this.userService.updateEmail(email, authContext.sub);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const generateProfile = (profile) => ({
  ...profile,
  givenName: profile.firstName,
  familyName: profile.lastName,
  deviceUDID: profile.deviceUdid,
  canChangeDevice: isAfter(new Date(), new Date(profile.deviceChange)),
  country: profile.country && profile.country.name,
  region: profile.region && profile.region.region,
});
