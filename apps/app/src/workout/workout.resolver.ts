import { CommonService } from '@lib/common';
import {
  OnDemandWorkout,
  ProgrammeLoaders,
  UserWorkout,
  Workout,
} from '@lib/power';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver('Workout')
export class WorkoutResolver {
  @ResolveField()
  __resolveType(parent: UserWorkout | OnDemandWorkout) {
    if (parent instanceof UserWorkout) {
      return 'UserWorkout';
    }
    if (parent instanceof OnDemandWorkout) {
      return 'OnDemandWorkout';
    }
    return null;
  }
}

export abstract class AbstractWorkoutResolver<T> {
  constructor(
    private readonly commonService: CommonService,
    private readonly programmeLoaders: ProgrammeLoaders,
  ) {}

  protected abstract getWorkoutModel(parent: T): Workout;

  @ResolveField('programme')
  public async getProgramme(@Parent() parent: T) {
    const workout = this.getWorkoutModel(parent);
    return this.programmeLoaders.findById.load(workout.trainingProgrammeId);
  }

  @ResolveField('isContinuous')
  public async getIsContinuous(@Parent() parent: T) {
    const workout = this.getWorkoutModel(parent);
    return workout.isContinuous;
  }

  @ResolveField('overviewImage')
  public async getOverviewImage(@Parent() parent: T) {
    const workout = this.getWorkoutModel(parent);
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
  public async getIntensity(@Parent() parent: T) {
    const workout = this.getWorkoutModel(parent);
    return workout.intensity;
  }

  @ResolveField('duration')
  public async getDuration(@Parent() parent: T) {
    const workout = this.getWorkoutModel(parent);
    return workout.duration;
  }

  @ResolveField('name')
  public async getName(
    @Parent() parent: T,
    @Context('language') language: string,
  ) {
    const workout = this.getWorkoutModel(parent);
    return workout.getTranslation(language)?.name;
  }

  @ResolveField('exercises')
  public async getExercises(@Parent() parent: T) {
    const workout = this.getWorkoutModel(parent);
    return null;
  }
}
