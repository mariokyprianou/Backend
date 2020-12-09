import { User, UserService } from '@lib/power/user';
import { Resolver, Query } from '@nestjs/graphql';

@Resolver('User')
export class UserResolver {
  constructor(private service: UserService) {}

  @Query('allUsers')
  async allUsers(): Promise<User[]> {
    return this.service.findAll();
  }
}
