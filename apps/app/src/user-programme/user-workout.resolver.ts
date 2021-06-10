import { ImageHandlerObjectStore, IMAGE_CDN } from '@lib/common';
import { ProgrammeLoaders, UserWorkout } from '@lib/power';
import { UserPowerLoaders } from '@lib/power/user-power/user-power.loaders';
import { Inject } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { WorkoutTagLoaders } from '../workout-tags/workout-tag.app.loaders';
import { AbstractWorkoutResolver } from '../workout/workout.resolver';

@Resolver('UserWorkout')
export class UserWorkoutResolver extends AbstractWorkoutResolver<UserWorkout> {
  constructor(
    @Inject(IMAGE_CDN) imageStore: ImageHandlerObjectStore,
    programmeLoaders: ProgrammeLoaders,
    private readonly userPowerLoaders: UserPowerLoaders,
    workoutTagLoaders: WorkoutTagLoaders,
  ) {
    super(imageStore, programmeLoaders, workoutTagLoaders);
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
