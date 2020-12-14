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
    return true;
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
