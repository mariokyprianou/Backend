import { RegisterUserInput } from '@lib/power/types';
import { UserService } from '@lib/power/user';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

@Resolver('UserProfile')
export class AuthResolver {
  constructor(private user: UserService) {}

  @Mutation('registerUser')
  async registerUser(
    // @Context('language') language: string,
    @Args('input') input: RegisterUserInput,
  ): Promise<boolean> {
    const user = await this.user.create(input);
    console.log(user);
    if (!user) {
      return false;
    }
    return true;
  }

  @Mutation('resendVerificationEmail')
  async resendVerificationEmail(
    @Args('email') email: string,
  ): Promise<boolean> {
    try {
      await this.user.sendVerification(email);
      return true;
    } catch (err) {
      return false;
    }
  }
}

interface UserProfile {
  givenName: string;
  familyName: string;
  email: string;
  gender: string;
  dateOfBirth: Date;
  country: string;
  region: string;
  deviceUDID: string;
  timeZone: string;
}
