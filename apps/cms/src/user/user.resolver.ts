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
import { AuthService } from '@lib/power/auth';
import { GraphQLError } from 'graphql';
import { CmsParams } from '@lib/common';
import { UserExportService } from '@lib/power/user/user-export.service';
import { UpdateUserInputDto } from './dto/update-user-input.dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { UserPowerService } from '@lib/power/user-power';
import { AccountLoaders } from '@lib/power/account/account.loaders';
import { ProgrammeLoaders } from '@lib/power/programme/programme.loaders';

@Resolver('User')
export class UserResolver {
  constructor(
    private userService: UserService,
    private userProgramService: UserProgrammeService,
    private authService: AuthService,
    private userExportService: UserExportService,
    private userPowerService: UserPowerService,
    private readonly accountLoaders: AccountLoaders,
    private readonly programmeLoaders: ProgrammeLoaders,
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
    const workoutWeek = await this.userPowerService.findUsersCurrentWeek(
      user.id,
    );

    return workoutWeek?.weekNumber;
  }

  @ResolveField('previousTrainers')
  async getPreviousTrainers(@Parent() user: User) {
    const allProgrammes = await this.userProgramService.allUserProgrammes(
      user.id,
    );
    return [
      ...new Set(allProgrammes.map((each) => each.trainingProgramme.trainerId)),
    ];
  }

  @ResolveField('deviceLimit')
  getDeviceLimit(@Parent() user: User) {
    return user.deviceChange;
  }

  @ResolveField('currentTrainingProgramme')
  async getCurrentTrainingProgramme(@Parent() user: User) {
    const trainingProgramme = await this.programmeLoaders.findActiveProgrammeByAccountId.load(
      user.id,
    );

    if (trainingProgramme) {
      return {
        id: trainingProgramme.id,
        name: trainingProgramme.localisations.find((tr) => tr.language === 'en')
          ?.description,
      };
    } else {
      return null;
    }
  }

  @ResolveField('subscription')
  async getCurrentSubscription() {
    // TODO hook with subscription
    return {
      isSubscribed: true,
      platform: 'ANDROID',
    };
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
