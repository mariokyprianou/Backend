import { UserPowerService } from '@lib/power';
import { ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../context';

@Resolver('CompleteWorkoutResponse')
export class CompleteWorkoutResponseResolver {
  constructor(private readonly service: UserPowerService) {}

  @ResolveField('programme')
  async getProgramme(@User() user: User) {
    return this.service.findCurrentProgramme(user.id);
  }
}
