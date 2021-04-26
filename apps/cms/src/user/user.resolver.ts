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
import { AuthService } from '@lib/power/auth';
import { GraphQLError } from 'graphql';
import { CmsParams } from '@lib/common';
import { UserExportService } from '@lib/power/user/user-export.service';
import { UpdateUserInputDto } from './dto/update-user-input.dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { AccountLoaders } from '@lib/power/account/account.loaders';
import { ProgrammeLoaders } from '@lib/power/programme/programme.loaders';
import { SubscriptionLoaders } from '@td/subscriptions';

@Resolver('User')
export class UserResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private userExportService: UserExportService,
    private readonly accountLoaders: AccountLoaders,
    private readonly programmeLoaders: ProgrammeLoaders,
    private readonly subscriptionLoaders: SubscriptionLoaders,
  ) {}

  @Query('allUsers')
  async allUsers(@Args() params: CmsParams<UserFilter>): Promise<User[]> {
    return this.userService.findAll(params);
  }

  @Query('User')
  async User(@Args('id') id) {
    return this.userService.findById(id);
  }

  @Mutation('deleteUser')
  async deleteUser(@Args('id') id) {
    const userToDelete = await this.userService.findById(id);
    await this.authService.delete(id);
    return userToDelete;
  }

  @ResolveField('currentWeek')
  async getCurrentWeek(@Parent() user: User): Promise<number> {
    const programmes = await this.programmeLoaders.findProgrammeInfoByAccountId.load(
      user.id,
    );
    const activeProgramme = programmes.find(
      (programme) => programme.isActive === true,
    );

    return activeProgramme?.currentWeek;
  }

  @ResolveField('previousTrainers')
  async getPreviousTrainers(@Parent() user: User) {
    const programmes = await this.programmeLoaders.findProgrammeInfoByAccountId.load(
      user.id,
    );
    return programmes.map((p) => p.trainerId);
  }

  @ResolveField('deviceLimit')
  getDeviceLimit(@Parent() user: User) {
    return user.deviceChange;
  }

  @ResolveField('currentTrainingProgramme')
  async getCurrentTrainingProgramme(@Parent() user: User) {
    const programmes = await this.programmeLoaders.findProgrammeInfoByAccountId.load(
      user.id,
    );
    const activeProgramme = programmes.find(
      (programme) => programme.isActive === true,
    );
    if (activeProgramme) {
      return {
        id: activeProgramme.trainingProgrammeId,
        name: activeProgramme.trainingProgrammeName,
      };
    }
  }

  @ResolveField('subscription')
  async getCurrentSubscription(@Parent() user: User) {
    const subscription = await this.subscriptionLoaders.findActiveSubscriptionByAccountId.load(
      user.id,
    );

    return subscription;
  }

  @ResolveField('emailMarketing')
  async getEmailMarketing(@Parent() user: User) {
    const account = await this.accountLoaders.findById.load(user.id);
    return account?.emails ?? false;
  }

  @Query('_allUsersMeta')
  async _allUsersMeta(
    @Args('filter') filter: UserFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.userService.findAllMeta(filter),
    };
  }

  @Mutation('updateEmail')
  async updateEmail(@Args('id') id: string, @Args('email') email: string) {
    const account = await this.userService.findById(id);
    if (account.email === email) {
      return this.userService.findById(id);
    }
    const success = await this.authService.updateEmail(email, {
      sub: account.cognitoSub,
    });

    if (success) {
      return this.userService.findById(id);
    } else {
      throw new GraphQLError('Unable to update email');
    }
  }

  @Mutation('updateUser')
  async updateUser(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') input: UpdateUserInputDto,
  ) {
    const success = await this.userService.adminUpdate(id, input);
    if (success) {
      return this.userService.findById(id);
    } else {
      throw new GraphQLError('Unable to update user');
    }
  }

  @Mutation('exportUsers')
  async exportUsers() {
    const res = await this.userExportService.exportUsers();
    return {
      downloadUrl: res.downloadUrl,
    };
  }
}

export interface UpdateUserInput {
  firstName: string;
  lastName: string;
  country: string;
  region?: string;
  timezone: string;
  deviceLimit: Date;
  trainingProgrammeId?: string;
  currentWeek?: number;
}
