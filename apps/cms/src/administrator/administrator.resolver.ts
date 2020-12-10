import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import { AdministratorService } from '@lib/power/administrator';

@Resolver('Administrator')
export class AdministratorResolver {
  constructor(private service: AdministratorService) {}

  @Query('Administrator')
  async Administrator(@Args('id') id: string) {
    return this.service.findById(id);
  }
}
