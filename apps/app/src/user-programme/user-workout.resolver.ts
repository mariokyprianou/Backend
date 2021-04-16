import { CommonService } from '@lib/common';
import { ProgrammeLoaders, UserWorkout } from '@lib/power';
import { UserPowerLoaders } from '@lib/power/user-power/user-power.loaders';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AbstractWorkoutResolver } from '../workout/workout.resolver';

@Resolver('UserWorkout')
export class UserWorkoutResolver extends AbstractWorkoutResolver<UserWorkout> {
  constructor(
    commonService: CommonService,
    programmeLoaders: ProgrammeLoaders,
    private readonly userPowerLoaders: UserPowerLoaders,
  ) {
    super(commonService, programmeLoaders);
  }

  getWorkoutModel(parent: UserWorkout) {
    return parent.workout;
  }

  @ResolveField('id')
  public async getId(@Parent() workout: UserWorkout) {
    return workout.id;
  }

  @ResolveField('orderIndex')
  public async getOrderIndex(@Parent() workout: UserWorkout) {
    return workout.orderIndex;
  }

  @ResolveField('completedAt')
  public async getCompletedAt(@Parent() workout: UserWorkout) {
    return workout.completedAt;
  }

  @ResolveField('exercises')
  public async getExercises(@Parent() workout: UserWorkout) {
    return this.userPowerLoaders.findExerciseByWorkoutId.load(
      workout.workout.id,
    );
  }
}
