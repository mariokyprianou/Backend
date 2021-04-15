import { CommonService } from '@lib/common';
import { UserWorkout } from '@lib/power';
import { UserPowerLoaders } from '@lib/power/user-power/user-power.loaders';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver('UserWorkout')
export class UserWorkoutResolver {
  constructor(
    private readonly commonService: CommonService,
    private readonly userPowerLoaders: UserPowerLoaders,
  ) {}

  @ResolveField('id')
  public async getId(@Parent() workout: UserWorkout) {
    return workout.id;
  }

  @ResolveField('isContinuous')
  public async getIsContinuous(@Parent() workout: UserWorkout) {
    return workout.workout.isContinuous;
  }

  @ResolveField('orderIndex')
  public async getOrderIndex(@Parent() workout: UserWorkout) {
    return workout.orderIndex;
  }

  @ResolveField('completedAt')
  public async getCompletedAt(@Parent() workout: UserWorkout) {
    return workout.completedAt;
  }

  @ResolveField('name')
  public async getName(
    @Parent() workout: UserWorkout,
    @Context('language') language: string,
  ) {
    const localisation = workout.workout.localisations.find(
      (localisation) => localisation.language === language,
    );
    return localisation.name;
  }

  @ResolveField('overviewImage')
  public async getOverviewImage(@Parent() workout: UserWorkout) {
    if (workout.workout.overviewImageKey) {
      return this.commonService.getPresignedUrl(
        workout.workout.overviewImageKey,
        this.commonService.env().FILES_BUCKET,
      );
    }
  }

  @ResolveField('intensity')
  public async getIntensity(@Parent() workout: UserWorkout) {
    return workout.workout.intensity;
  }

  @ResolveField('duration')
  public async getDuration(@Parent() workout: UserWorkout) {
    return workout.workout.duration;
  }

  @ResolveField('exercises')
  public async getExercises(@Parent() workout: UserWorkout) {
    return this.userPowerLoaders.findExerciseByWorkoutId.load(
      workout.workout.id,
    );
  }
}

// type UserWorkout {
//   id: ID!
//   orderIndex: Int!
//   overviewImage: URL
//   intensity: IntensityEnum!
//   duration: Int!
//   name: String!
//   completedAt: DateTime
//   exercises: [UserWorkoutExercise]
// }
