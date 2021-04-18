import { UserWorkoutWeek } from '@lib/power';
import { UserPowerLoaders } from '@lib/power/user-power/user-power.loaders';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver('UserWorkoutWeek')
export class UserWorkoutWeekResolver {
  constructor(private readonly userPowerLoaders: UserPowerLoaders) {}

  @ResolveField('startedAt')
  public async getStartedAt(@Parent() week: UserWorkoutWeek) {
    return week.startedAt;
  }

  @ResolveField('weekNumber')
  public async getWeekNumber(@Parent() week: UserWorkoutWeek) {
    return week.weekNumber;
  }

  @ResolveField('workouts')
  public async getWorkouts(@Parent() week: UserWorkoutWeek) {
    if (week.workouts) {
      return week.workouts;
    }
    return this.userPowerLoaders.findUserWorkoutsByWeekId.load(week.id);
  }
}
