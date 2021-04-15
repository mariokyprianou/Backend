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
  OnDemandWorkoutService,
  UpdateOnDemandWorkoutDto,
  OnDemandWorkoutFilter,
  OnDemandWorkout,
} from '@lib/power';
import { CmsParams, CommonService } from '@lib/common';
import { ParseUUIDPipe } from '@nestjs/common';
import { WorkoutCmsResolver } from './workout.cms.resolver';
import { ExerciseLoaders } from '../exercise/exercise.loader';

@Resolver('OnDemandWorkout')
export class OnDemandWorkoutCmsResolver extends WorkoutCmsResolver<OnDemandWorkout> {
  constructor(
    commonService: CommonService,
    exerciseLoaders: ExerciseLoaders,
    private workoutService: OnDemandWorkoutService,
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
}
