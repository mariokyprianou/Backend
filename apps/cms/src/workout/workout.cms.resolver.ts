import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Workout } from '@lib/power';
import { CommonService } from '@lib/common';
import { ExerciseLoaders } from '../exercise/exercise.loader';

@Resolver('Workout')
export class WorkoutCmsResolver<T = Workout> {
  constructor(
    private commonService: CommonService,
    private exerciseLoaders: ExerciseLoaders,
  ) {}

  @ResolveField('overviewImage')
  getOverviewImage(@Parent() parent: T) {
    const workout = this.getWorkout(parent);
    if (!workout.overviewImageKey) {
      return null;
    }
    return {
      key: workout.overviewImageKey,
      url: this.commonService.getPresignedUrl(
        workout.overviewImageKey,
        this.commonService.env().FILES_BUCKET,
        'getObject',
      ),
    };
  }

  @ResolveField('isContinuous')
  getIsContinuous(@Parent() parent: T) {
    return this.getWorkout(parent).isContinuous;
  }

  @ResolveField('intensity')
  getIntensity(@Parent() parent: T) {
    return this.getWorkout(parent).intensity;
  }

  @ResolveField('duration')
  getDuration(@Parent() parent: T) {
    return this.getWorkout(parent).duration;
  }

  @ResolveField('localisations')
  getLocalisations(@Parent() parent: T) {
    return this.getWorkout(parent).localisations;
  }

  @ResolveField('exercises')
  async getExercises(@Parent() parent: T) {
    const workout = this.getWorkout(parent);

    return this.exerciseLoaders.findByWorkoutId.load(workout.id);
  }

  protected getWorkout(parent: any): Workout {
    return parent;
  }
}
