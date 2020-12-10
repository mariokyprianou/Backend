import { User, UserFilter, UserService } from '@lib/power/user';
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import { UserProgrammeService } from '@lib/power/user-program/user-programme.service';
import { AccountService } from '@lib/power/account';

@Resolver('User')
export class UserResolver {
  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private userProgramService: UserProgrammeService,
  ) {}

  @Query('allUsers')
  async allUsers(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'first_name',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: UserFilter = {},
  ): Promise<User[]> {
    return this.userService.findAll(
      page,
      perPage,
      sortField,
      sortOrder,
      filter,
    );
  }

  @Query('User')
  async User(@Args('id') id) {
    return await this.userService.findById(id);
  }

  @ResolveField('currentTrainingProgramme')
  async getCurrentTrainingProgramme(@Parent() user: User) {
    const account = await this.accountService.findById(user.id);

    const currentUserProgram = await this.userProgramService.findById(
      account.trainingProgramId,
    );

    if (currentUserProgram) {
      return {
        id: currentUserProgram.id,
        name: currentUserProgram.programme.localisations.find(
          (x) => x.language == 'en',
        ).description,
      };
    } else {
      return null;
    }
  }

  @Query('_allUsersMeta')
  async _allUsersMeta(
    @Args('filter') filter: UserFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.userService.findAllMeta(filter),
    };
  }
}
