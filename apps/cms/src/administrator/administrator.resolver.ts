import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import {
  AdministratorService,
  AdministratorFilter,
} from '@lib/power/administrator';
import { CmsUser } from '../context';

@Resolver('Administrator')
export class AdministratorResolver {
  constructor(private service: AdministratorService) {}

  @Query('Administrator')
  async Administrator(@Args('id') id: string): Promise<AdministratorType> {
    return this.service.findById(id);
  }

  @Query('allAdministrators')
  async allAdministrators(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'name',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: AdministratorFilter = {},
  ) {
    return this.service.findAll(page, perPage, sortField, sortOrder, filter);
  }

  @Query('_allAdministratorsMeta')
  async _allAdministratorsMeta(
    @Args('filter') filter: AdministratorFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.service.findAllMeta(filter),
    };
  }

  @Mutation('createAdministrator')
  async createAdministrator(
    @Args('name') name: string,
    @Args('email') email: string,
  ) {
    return await this.service.create(name, email);
  }

  @Mutation('updateAdministrator')
  async updateAdministrator(
    @Args('id') id: string,
    @Args('name') name: string,
    @Args('email') email: string,
  ) {
    return await this.service.update(id, name, email);
  }

  @Mutation('deleteAdministrator')
  async deleteAdministrator(@CmsUser() user: CmsUser, @Args('id') id: string) {
    if (user.sub === id) {
      throw new Error('Unable to delete own user.');
    }

    return await this.service.delete(id);
  }
}

interface AdministratorType {
  id: string;
  name: string;
  email: string;
}
