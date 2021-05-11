import { CommonService } from '@lib/common';
import {
  ExerciseLoaders,
  OnDemandWorkout,
  ProgrammeLoaders,
  Workout,
} from '@lib/power';
import { subWeeks } from 'date-fns';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

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
}

@Resolver('Workout')
export class WorkoutResolver extends AbstractWorkoutResolver<Workout> {
  constructor(
    commonService: CommonService,
    programmeLoaders: ProgrammeLoaders,
    private readonly exerciseLoaders: ExerciseLoaders,
  ) {
    super(commonService, programmeLoaders);
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
