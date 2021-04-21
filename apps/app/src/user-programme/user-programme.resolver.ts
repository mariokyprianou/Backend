import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { isNil } from 'lodash';
import { AuthContext, Programme, ScheduledWorkoutService } from '@lib/power';
import { CommonService } from '@lib/common';
import { AbstractProgrammeResolver } from '../programme/programme.app.resolver';
import { TrainerLoaders } from '@lib/power/trainer/trainer.loaders';
import { ProgrammeLoaders } from '@lib/power/programme/programme.loaders';
import { UserPowerLoaders } from '@lib/power/user-power/user-power.loaders';
import { WorkoutLoaders } from '@lib/power/workout/workout.loaders';

@Resolver('UserProgramme')
export class UserProgrammeResolver extends AbstractProgrammeResolver {
  constructor(
    workoutService: ScheduledWorkoutService,
    commonService: CommonService,
    trainerLoaders: TrainerLoaders,
    programmeLoaders: ProgrammeLoaders,
    private readonly userPowerLoaders: UserPowerLoaders,
    private readonly workoutLoaders: WorkoutLoaders,
  ) {
    super(workoutService, commonService, trainerLoaders, programmeLoaders);
  }

  @ResolveField('isComplete')
  async getIsComplete(
    @Context('authContext') user: AuthContext,
  ): Promise<boolean> {
    const currentWeek = await this.userPowerLoaders.findUserCurrentWeek.load(
      user.id,
    );
    return isNil(currentWeek);
  }

  @ResolveField('currentWeek')
  public async getCurrentWeek(@Context('authContext') user: AuthContext) {
    return this.userPowerLoaders.findUserCurrentWeek.load(user.id);
  }

  @ResolveField('nextWeek')
  public async getNextWeek(
    @Parent() programme: Programme,
    @Context('authContext') user: AuthContext,
  ) {
    const currentWeek = await this.userPowerLoaders.findUserCurrentWeek.load(
      user.id,
    );
    if (!currentWeek) {
      // Programme complete
      return null;
    }

    const weekNumber = currentWeek.weekNumber + 1;
    const workouts = await this.workoutLoaders.findWorkoutsByProgrammeAndWeek.load(
      [programme.id, weekNumber],
    );

    if (!workouts?.length) {
      return null;
    }

    return { weekNumber, workouts };
  }
}
