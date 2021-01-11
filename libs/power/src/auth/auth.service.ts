import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';
import { isAfter } from 'date-fns';
import { AccountService } from '../account';
import {
  AuthContext,
  ChangeDevice,
  RegisterUserInput,
  UserPreference,
  UserProfileInput,
} from '../types';
import { UserService } from '../user';
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

    // TODO IF ANYTHING FAILS WE NEED TO CLEAN UP THE OTHER STUFF

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
  country: profile.country && profile.country.country,
  region: profile.region && profile.region.region,
});
