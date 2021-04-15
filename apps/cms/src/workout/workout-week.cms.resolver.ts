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
  ProgrammeWorkout,
  WorkoutFilter,
  WorkoutService,
} from '@lib/power/workout';
import { CmsParams } from '@lib/common';
import { CreateProgrammeWorkoutDto } from './dto/create-programme-workout.dto';
import { UpdateProgrammeWorkoutDto } from './dto/update-programme-workout.dto';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver('WorkoutWeek')
export class WorkoutWeekCmsResolver {
  constructor(private workoutService: WorkoutService) {}

  @ResolveField('workout')
  async getWorkout(@Parent() workoutWeek: ProgrammeWorkout) {
    return workoutWeek.workout;
  }

  @Mutation('createWorkoutWeek')
  async createWorkout(
    @Args('workout') workout: CreateProgrammeWorkoutDto,
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
  async Workout(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<ProgrammeWorkout> {
    return this.workoutService.findById(id);
  }

  @Mutation('updateWorkoutWeek')
  async updateWorkout(
    @Args('id') id: string,
    @Args('workout') workout: UpdateProgrammeWorkoutDto,
  ): Promise<ProgrammeWorkout> {
    return this.workoutService.update(id, workout);
  }

  @Mutation('deleteWorkoutWeek')
  async deleteWorkout(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<ProgrammeWorkout> {
    const workout = await this.workoutService.findById(id);
    await this.workoutService.delete(id);

    return workout;
  }
}
