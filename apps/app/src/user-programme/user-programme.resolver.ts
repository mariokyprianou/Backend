import { AuthContext, ScheduledWorkoutService } from '@lib/power';
import { Context, ResolveField, Resolver } from '@nestjs/graphql';
import { CommonService } from '@lib/common';
import { ProgrammeResolver } from '../programme/programme.app.resolver';
import { TrainerLoaders } from '@lib/power/trainer/trainer.loaders';
import { ProgrammeLoaders } from '@lib/power/programme/programme.loaders';
import { UserPowerLoaders } from '@lib/power/user-power/user-power.loaders';

@Resolver('UserProgramme')
export class UserProgrammeResolver extends ProgrammeResolver {
  constructor(
    workoutService: ScheduledWorkoutService,
    commonService: CommonService,
    trainerLoaders: TrainerLoaders,
    programmeLoaders: ProgrammeLoaders,
    private readonly userPowerLoaders: UserPowerLoaders,
  ) {
    super(workoutService, commonService, trainerLoaders, programmeLoaders);
  }

  @ResolveField('currentWeek')
  public async getCurrentWeek(@Context('authContext') user: AuthContext) {
    const weeks = await this.userPowerLoaders.findUserCurrentWeeks.load(
      user.id,
    );
    return weeks.find((week) => week.startedAt !== null);
  }

  @ResolveField('nextWeek')
  public async getNextWeek(@Context('authContext') user: AuthContext) {
    const weeks = await this.userPowerLoaders.findUserCurrentWeeks.load(
      user.id,
    );
    console.log({ weeks });
    return weeks.find((week) => week.startedAt === null);
  }
}
