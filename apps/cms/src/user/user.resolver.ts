import { User, UserFilter, UserService } from '@lib/power/user';
import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import { UserProgrammeService } from '@lib/power/user-programme/user-programme.service';
import { AccountService } from '@lib/power/account';
import { AuthService } from '@lib/power/auth';

@Resolver('User')
export class UserResolver {
  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private userProgramService: UserProgrammeService,
    private authService: AuthService,
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

  @Mutation('deleteUser')
  async deleteUser(@Args('id') id) {
    const userToDelete = this.userService.findById(id);
    // Moved to new auth service
    // await this.accountService.delete(id);
    // await this.userService.delete(id);
    await this.authService.delete(id);
    return userToDelete;
  }

  @ResolveField('currentTrainingProgramme')
  async getCurrentTrainingProgramme(@Parent() user: User) {
    // TODO: this is where it is currently crashing with the user
    // Queries as there wasn't data in the database yet
    const account = await this.accountService.findById(user.id);

    const currentUserProgram = await this.userProgramService.findById(
      account.userTrainingProgrammeId,
    );

    if (currentUserProgram) {
      return {
        id: currentUserProgram.id,
        name: currentUserProgram.trainingProgramme.localisations.find(
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
