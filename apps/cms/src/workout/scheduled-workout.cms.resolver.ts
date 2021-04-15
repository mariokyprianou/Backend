import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import {
  CreateScheduledWorkoutDto,
  ScheduledWorkout,
  ScheduledWorkoutFilter,
  ScheduledWorkoutService,
  UpdateScheduledWorkoutDto,
} from '@lib/power/scheduled-workout';
import { CmsParams } from '@lib/common';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver('WorkoutWeek')
export class ScheduledWorkoutCmsResolver {
  constructor(private workoutService: ScheduledWorkoutService) {}

  @ResolveField('workout')
  async getWorkout(@Parent() workoutWeek: ScheduledWorkout) {
    return workoutWeek.workout;
  }

  @Mutation('createWorkoutWeek')
  async createWorkout(
    @Args('workout') workout: CreateScheduledWorkoutDto,
  ): Promise<ScheduledWorkout> {
    return this.workoutService.create(workout);
  }

  @Query('_allWorkoutWeeksMeta')
  async _allWorkoutsMeta(
    @Args() params: CmsParams<ScheduledWorkoutFilter>,
  ): Promise<ListMetadata> {
    const { count } = await this.workoutService.findCount(params);
    return { count };
  }

  @Query('allWorkoutWeeks')
  async allWorkouts(
    @Args() params: CmsParams<ScheduledWorkoutFilter>,
  ): Promise<ScheduledWorkout[]> {
    return this.workoutService.findAll(params);
  }

  @Query('WorkoutWeek')
  async Workout(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<ScheduledWorkout> {
    return this.workoutService.findById(id);
  }

  @Mutation('updateWorkoutWeek')
  async updateWorkout(
    @Args('id') id: string,
    @Args('workout') workout: UpdateScheduledWorkoutDto,
  ): Promise<ScheduledWorkout> {
    return this.workoutService.updateWorkout(id, workout);
  }

  @Mutation('deleteWorkoutWeek')
  async deleteWorkout(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<ScheduledWorkout> {
    const workout = await this.workoutService.findById(id);
    await this.workoutService.deleteWorkout(id);

    return workout;
  }
}
