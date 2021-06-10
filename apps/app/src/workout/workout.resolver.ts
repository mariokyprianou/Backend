import { ImageHandlerObjectStore, IMAGE_CDN } from '@lib/common';
import {
  ExerciseLoaders,
  OnDemandWorkout,
  ProgrammeLoaders,
  Workout,
} from '@lib/power';
import { subWeeks } from 'date-fns';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { WorkoutTagLoaders } from '../workout-tags/workout-tag.app.loaders';

export abstract class AbstractWorkoutResolver<T> {
  constructor(
    private readonly imageStore: ImageHandlerObjectStore,
    private readonly programmeLoaders: ProgrammeLoaders,
    private readonly workoutTagLoaders: WorkoutTagLoaders,
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

    return this.imageStore.getSignedUrl(workout.overviewImageKey, {
      expiresIn: 60 * 24 * 7,
      resize: {
        width: 720,
      },
    });
  }

  @ResolveField('overviewImageThumbnail')
  public async getOverviewImageThumbnail(@Parent() parent: T) {
    const workout = this.getWorkoutModel(parent);
    if (!workout.overviewImageKey) {
      return null;
    }

    return this.imageStore.getSignedUrl(workout.overviewImageKey, {
      expiresIn: 60 * 24 * 7,
      resize: {
        width: 200,
      },
    });
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

  @ResolveField('tags')
  public async getTage(@Parent() parent: T) {
    const workout = this.getWorkoutModel(parent);
    return this.workoutTagLoaders.findTagsByWorkoutId.load(workout.id);
  }
}

@Resolver('Workout')
export class WorkoutResolver extends AbstractWorkoutResolver<Workout> {
  constructor(
    @Inject(IMAGE_CDN) imageStore: ImageHandlerObjectStore,
    programmeLoaders: ProgrammeLoaders,
    workoutTagLoaders: WorkoutTagLoaders,
    private readonly exerciseLoaders: ExerciseLoaders,
  ) {
    super(imageStore, programmeLoaders, workoutTagLoaders);
  }

  protected getWorkoutModel(parent: Workout | OnDemandWorkout): Workout {
    if (parent instanceof OnDemandWorkout) {
      return parent.workout;
    } else {
      return parent;
    }
  }

  @ResolveField('id')
  public async getId(@Parent() workout: Workout | OnDemandWorkout) {
    return workout.id;
  }

  @ResolveField('isNew')
  public isNew(@Parent() parent: Workout | OnDemandWorkout): boolean {
    if (parent instanceof OnDemandWorkout) {
      const cutoff = subWeeks(new Date(), 2);
      return cutoff < parent.createdAt;
    }

    return false;
  }

  @ResolveField('exercises')
  public async getExercises(@Parent() parent: Workout | OnDemandWorkout) {
    const workout = this.getWorkoutModel(parent);
    return this.exerciseLoaders.findByWorkoutId.load(workout.id);
  }
}
