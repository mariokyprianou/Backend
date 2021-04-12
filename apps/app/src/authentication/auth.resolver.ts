import { AuthService } from '@lib/power/auth';
import { RegisterUserInput } from '@lib/power/types';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

@Resolver('LoginResponse')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation('registerUser')
  async registerUser(
    @Args('input') input: RegisterUserInput,
  ): Promise<boolean> {
    const success: boolean = await this.authService.register(input);
    return success;
  }

  @Mutation('resendVerificationEmail')
  async resendVerificationEmail(
    @Args('email') email: string,
  ): Promise<boolean> {
    try {
      await this.authService.sendVerification(email);
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
    return this.authService.login(email, password);
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
