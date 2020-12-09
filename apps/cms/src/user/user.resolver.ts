import { User, UserFilter, UserService } from '@lib/power/user';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';

@Resolver('User')
export class UserResolver {
  constructor(private service: UserService) {}

  @Query('allUsers')
  async allUsers(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'first_name',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: UserFilter = {},
  ): Promise<User[]> {
    return this.service.findAll(page, perPage, sortField, sortOrder, filter);
  }

  @Query('_allUsersMeta')
  async _allUsersMeta(
    @Args('filter') filter: UserFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.service.findAllMeta(filter),
    };
  }

  @Query('User')
  async User(@Args('id') id) {
    return await this.service.findById(id);
  }
}
