import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { IProgrammeWorkout, ListMetadata } from '@lib/power/types';
import {
  ProgrammeWorkout,
  WorkoutFilter,
  WorkoutService,
} from '@lib/power/workout';
import { CmsParams } from '@lib/common';

@Resolver('WorkoutWeek')
export class WorkoutWeekResolver {
  constructor(private workoutService: WorkoutService) {}

  @ResolveField('workout')
  async getWorkout(@Parent() workoutWeek: ProgrammeWorkout) {
    return workoutWeek.workout;
  }

  @Mutation('createWorkoutWeek')
  async createWorkout(
    @Args('workout') workout: IProgrammeWorkout,
  ): Promise<ProgrammeWorkout> {
    return this.workoutService.create(workout);
  }

  @Query('_allWorkoutWeeksMeta')
  async _allWorkoutsMeta(
    @Args() params: CmsParams<WorkoutFilter>,
  ): Promise<ListMetadata> {
    const { count } = await this.workoutService.findCount(params);
    return { count };
  }

  @Query('allWorkoutWeeks')
  async allWorkouts(
    @Args() params: CmsParams<WorkoutFilter>,
  ): Promise<ProgrammeWorkout[]> {
    return this.workoutService.findAll(params);
  }

  @Query('WorkoutWeek')
  async Workout(@Args('id') id: string): Promise<ProgrammeWorkout> {
    return this.workoutService.findById(id);
  }

  @Mutation('updateWorkoutWeek')
  async updateWorkout(
    @Args('id') id: string,
    @Args('workout') workout: IProgrammeWorkout,
  ): Promise<ProgrammeWorkout> {
    return this.workoutService.update(id, workout);
  }

  @Mutation('deleteWorkoutWeek')
  async deleteWorkout(@Args('id') id: string): Promise<ProgrammeWorkout> {
    const workout = await this.workoutService.findById(id);
    await this.workoutService.delete(id);

    return workout;
  }
}
