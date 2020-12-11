import { RegisterUserInput } from '@lib/power/types';
import { AuthService } from '@lib/power/auth';
import { UserService } from '@lib/power/user';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

@Resolver('UserProfile')
export class AuthResolver {
  constructor(private auth: AuthService, private user: UserService) {}

  @Mutation('registerUser')
  async registerUser(
    @Context('language') language: string,
    @Args('input') input: RegisterUserInput,
  ): Promise<boolean> {
    return this.auth.register(input);
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
