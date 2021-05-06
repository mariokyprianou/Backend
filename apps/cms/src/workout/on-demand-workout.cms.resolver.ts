import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  CreateOnDemandWorkoutDto,
  ListMetadata,
  OnDemandWorkoutCmsService,
  UpdateOnDemandWorkoutDto,
  OnDemandWorkoutFilter,
  OnDemandWorkout,
  ProgrammeLoaders,
} from '@lib/power';
import { CmsParams, CommonService } from '@lib/common';
import { ParseUUIDPipe } from '@nestjs/common';
import { WorkoutCmsResolver } from './workout.cms.resolver';
import { ExerciseCmsLoaders } from '../exercise/exercise.cms.loaders';
import { WorkoutLoaders } from '@lib/power/workout/workout.loaders';

@Resolver('OnDemandWorkout')
export class OnDemandWorkoutCmsResolver extends WorkoutCmsResolver<OnDemandWorkout> {
  constructor(
    commonService: CommonService,
    exerciseLoaders: ExerciseCmsLoaders,
    private workoutService: OnDemandWorkoutCmsService,
    private workoutLoaders: WorkoutLoaders,
    private programmeLoaders: ProgrammeLoaders,
  ) {
    super(commonService, exerciseLoaders);
  }

  @Query('_allOnDemandWorkoutsMeta')
  async _allOnDemandWorkoutsMeta(
    @Args() params: CmsParams<OnDemandWorkoutFilter>,
  ): Promise<ListMetadata> {
    return this.workoutService.findCount(params);
  }

  @Query('allOnDemandWorkouts')
  async allOnDemandWorkouts(
    @Args() params: CmsParams<OnDemandWorkoutFilter>,
  ): Promise<OnDemandWorkout[]> {
    return this.workoutService.findAll(params);
  }

  @Query('OnDemandWorkout')
  async OnDemandWorkout(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<OnDemandWorkout> {
    return this.workoutService.findById(id);
  }

  @Mutation('createOnDemandWorkout')
  async createOnDemandWorkout(
    @Args('workout') workout: CreateOnDemandWorkoutDto,
  ): Promise<OnDemandWorkout> {
    return this.workoutService.create(workout);
  }

  @Mutation('updateOnDemandWorkout')
  async updateOnDemandWorkout(
    @Args('id') id: string,
    @Args('workout') workout: UpdateOnDemandWorkoutDto,
  ): Promise<OnDemandWorkout> {
    return this.workoutService.update(id, workout);
  }

  @Mutation('deleteOnDemandWorkout')
  async deleteOnDemandWorkout(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<OnDemandWorkout> {
    const workout = await this.workoutService.findById(id);
    await this.workoutService.delete(id);
    return workout;
  }

  getWorkout(parent: OnDemandWorkout) {
    return parent.workout;
  }

  @ResolveField('id')
  async getId(@Parent() workout: OnDemandWorkout) {
    return workout.id;
  }

  @ResolveField('tagIds')
  async getTagIds(@Parent() onDemandWorkout: OnDemandWorkout) {
    return this.workoutLoaders.findWorkoutTagIdsByWorkoutId.load(
      onDemandWorkout.workout.id,
    );
  }

  @ResolveField('programme')
  async getProgramme(@Parent() onDemandWorkout: OnDemandWorkout) {
    return this.programmeLoaders.findById.load(
      onDemandWorkout.trainingProgrammeId,
    );
  }
}
