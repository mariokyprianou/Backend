import { AuthService } from '@lib/power/auth';
import { RegisterUserInput } from '@lib/power/types';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

@Resolver('UserProfile')
export class AuthResolver {
  constructor(private user: AuthService) {}

  @Mutation('registerUser')
  async registerUser(
    // @Context('language') language: string,
    @Args('input') input: RegisterUserInput,
  ): Promise<boolean> {
    const user = await this.user.register(input);
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

  @Mutation('login')
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<TokenResponse> {
    return this.user.login(email, password);
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

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expires: number;
}
