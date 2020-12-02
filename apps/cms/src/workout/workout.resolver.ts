import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { constructLimits } from '../constructLimits';
import { Filter, IProgrammeWorkout, ListMetadata } from '@lib/power/types';
import { ProgrammeWorkout, Workout, WorkoutService } from '@lib/power/workout';
import { CommonService } from '@lib/common';
import { ExerciseService } from '@lib/power/exercise';

interface WorkoutFilter extends Filter {
  name: string;
  trainer: string;
  programme: string;
}

@Resolver('WorkoutWeek')
export class WorkoutResolver {
  constructor(
    private service: WorkoutService,
    private common: CommonService,
    private exercise: ExerciseService,
  ) {}

  constructFilters = (query: any, filter: WorkoutFilter) => {
    if (filter) {
      if (filter.id) {
        query.findByIds([filter.id]);
      }

      if (filter.ids) {
        query.whereIn('id', filter.ids);
      }

      if (filter.name) {
        query.where('name', 'ilike', `%${filter.name}%`);
      }
    }

    return query;
  };

  @ResolveField('workout')
  async getWorkout(@Parent() workout: ProgrammeWorkout) {
    return {
      overviewImage:
        workout.workout.overviewImageKey &&
        (await this.common.getPresignedUrl(
          workout.workout.overviewImageKey,
          this.common.env().FILES_BUCKET,
          'getObject',
        )),
      intensity: workout.workout.intensity,
      duration: workout.workout.duration,
      localisations: workout.workout.localisations,
      exercises: await Promise.all(
        workout.workout.exercises.map(async (each) => ({
          setType: each.setType,
          sets: each.sets,
          exercise: await this.exercise.findById(each.exerciseId),
          orderIndex: each.orderIndex,
        })),
      ),
    };
  }

  @Mutation('createWorkout')
  async createWorkout(
    @Args('workout') workout: IProgrammeWorkout,
  ): Promise<ProgrammeWorkout> {
    return this.service.create(workout);
  }

  @Query('_allWorkoutsMeta')
  async _allWorkoutsMeta(
    @Args('filter') filter: WorkoutFilter,
  ): Promise<ListMetadata> {
    const [count] = await this.constructFilters(this.service.count(), filter);
    return count;
  }

  @Query('allWorkouts')
  async allWorkouts(
    @Args('page') page: number,
    @Args('perPage') perPage: number,
    @Args('sortField') sortField: string,
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' | null,
    @Args('filter') filter: WorkoutFilter,
  ): Promise<ProgrammeWorkout[]> {
    return this.constructFilters(
      constructLimits(this.service.findAll(), {
        page,
        perPage,
        sortField,
        sortOrder,
      }),
      filter,
    );
  }

  @Query('Workout')
  async Workout(@Args('id') id: string): Promise<ProgrammeWorkout> {
    return this.service.findById(id);
  }

  @Mutation('updateWorkout')
  async updateWorkout(
    @Args('id') id: string,
    @Args('workout') workout: IProgrammeWorkout,
  ): Promise<ProgrammeWorkout> {
    return this.service.update(id, workout);
  }

  @Mutation('deleteWorkout')
  async deleteWorkout(@Args('id') id: string): Promise<ProgrammeWorkout> {
    const WorkoutToDelete = await this.service.findById(id);
    await this.service.delete(id);

    return WorkoutToDelete;
  }
}
