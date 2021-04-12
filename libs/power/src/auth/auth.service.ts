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
import { UserService } from '../user';
import { UserPowerService } from '../user-power';
import { UserProgrammeService } from '../user-programme';
import { UserWorkoutService } from '../user-workout';
import { UserWorkoutWeekService } from '../user-workout-week';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER') private authProvider: AuthProviderService,
    private accountService: AccountService,
    private userService: UserService,
    private userWorkoutService: UserWorkoutService,
    private userWorkoutWeekService: UserWorkoutWeekService,
    private userProgrammeService: UserProgrammeService,
    private userPowerService: UserPowerService,
  ) {}

  public async register(input: RegisterUserInput): Promise<boolean> {
    const programme = await Programme.query().findById(input.programme);
    if (!programme) {
      throw new GraphQLError('Programme does not exist.');
    }

    // register with the auth provider
    const res = await this.authProvider.registerWithEmailVerificationLink(
      input.email,
      input.password,
      {},
    );

    // add to the user table
    const user = await this.userService.create(input, res.UserSub);

    const transaction = await Account.startTransaction();
    try {
      await transaction.raw('SET CONSTRAINTS ALL DEFERRED');
      const userTrainingProgrammeId = uuid.v4();

      // Create the account
      const account = await Account.query(transaction).insertAndFetch({
        id: user.id,
        cognitoUsername: res.UserSub,
        userTrainingProgrammeId,
      });

      await this.userPowerService.setUserProgramme(
        {
          accountId: account.id,
          trainingProgrammeId: input.programme,
          week: 1,
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

  public async profile(context: AuthContext) {
    const profile = await this.userService.findBySub(context.sub);
    return generateProfile(profile);
  }

  public async preference(context: AuthContext) {
    return this.accountService.findBySub(context.sub);
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

  public async updatePreference(
    input: UserPreference,
    authContext: AuthContext,
  ) {
    return this.accountService.updatePreference(input, authContext.sub);
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

  public async allCompletedUserWorkouts(authContext: AuthContext) {
    // Todo this I need the profile
    // User training programmes
    // Workout weeks
    // Workouts where 'completed_at' is not null
    const profile = await this.userService.findBySub(authContext.sub);
    const allUserTrariningProgrammes = await this.userProgrammeService
      .findAll()
      .where('account_id', profile.id);
    const allUserWorkoutWeeks = await this.userWorkoutWeekService
      .findAll()
      .whereIn(
        'user_training_programme_id',
        allUserTrariningProgrammes.map((each) => each.id),
      );
    const allCompletedWorkouts = await this.userWorkoutService
      .findAll()
      .whereIn(
        'user_workout_week_id',
        allUserWorkoutWeeks.map((each) => each.id),
      )
      .andWhereNot('completed_at', null);

    return allCompletedWorkouts.length;
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
