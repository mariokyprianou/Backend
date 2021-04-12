import { CommonService } from '@lib/common';
import { Workout } from '@lib/power';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver('Workout')
export class WorkoutResolver {
  constructor(private readonly commonService: CommonService) {}

  @ResolveField('overviewImage')
  public async getOverviewImage(@Parent() workout: Workout) {
    if (!workout.overviewImageKey) {
      return null;
    }

    return this.commonService.getPresignedUrl(
      workout.overviewImageKey,
      this.commonService.env().FILES_BUCKET,
      'getObject',
    );
  }

  @ResolveField('intensity')
  public async getIntensity(@Parent() workout: Workout) {
    return workout.intensity;
  }

  @ResolveField('duration')
  public async getDuration(@Parent() workout: Workout) {
    return workout.duration;
  }

  @ResolveField('name')
  public async getName(
    @Parent() workout: Workout,
    @Context('language') language: string,
  ) {
    return workout.getTranslation(language)?.name;
  }

  @ResolveField('exercises')
  public async getExercises(@Parent() workout: Workout) {
    return null;
  }
}
