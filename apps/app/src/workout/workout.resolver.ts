import { CommonService } from '@lib/common';
import { ExerciseLoaders, ProgrammeLoaders, Workout } from '@lib/power';
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
    console.log(workout);
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

  protected getWorkoutModel(parent: Workout): Workout {
    return parent;
  }

  @ResolveField('id')
  public async getId(@Parent() workout: Workout) {
    return workout.id;
  }

  @ResolveField('exercises')
  public async getExercises(@Parent() workout: Workout) {
    return this.exerciseLoaders.findByWorkoutId.load(workout.id);
  }
}
