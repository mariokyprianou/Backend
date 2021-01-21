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
  environment: string;
  week: number;
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

      if (filter.week) {
        query.where('week_number', filter.week);
      }

      // if (filter.environment) {
      //   query.where(
      //     'training_programme_workout.programme.environment',
      //     filter.environment,
      //   );
      // }
      // if (filter.trainer) {
      //   query.where(
      //     'training_programme_workout.programme.trainer',
      //     filter.trainer,
      //   );
      // }
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

  @Mutation('createWorkoutWeek')
  async createWorkout(
    @Args('workout') workout: IProgrammeWorkout,
  ): Promise<ProgrammeWorkout> {
    return this.service.create(workout);
  }

  @Query('_allWorkoutWeeksMeta')
  async _allWorkoutsMeta(
    @Args('filter') filter: WorkoutFilter,
  ): Promise<ListMetadata> {
    const [count] = await this.constructFilters(this.service.count(), filter);
    return count;
  }

  @Query('allWorkoutWeeks')
  async allWorkouts(
    @Args('page') page: number,
    @Args('perPage') perPage: number,
    @Args('sortField') sortField: string,
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' | null,
    @Args('filter') filter: WorkoutFilter,
  ): Promise<ProgrammeWorkout[]> {
    const results = await this.constructFilters(
      constructLimits(this.service.findAll(), {
        page,
        perPage,
        sortField,
        sortOrder,
      }),
      filter,
    );
    console.log('RESULTS', JSON.stringify(results));
    if (filter.trainer) {
      if (filter.environment) {
        return results.filter(
          (each) =>
            each.programme.trainerId === filter.trainer &&
            each.programme.environment === filter.environment,
        );
      }
      return results.filter(
        (each) => each.programme.trainerId === filter.trainer,
      );
    }
    if (filter.environment) {
      return results.filter(
        (each) => each.programme.environment === filter.environment,
      );
    }
    return results;
  }

  @Query('WorkoutWeek')
  async Workout(@Args('id') id: string): Promise<ProgrammeWorkout> {
    return this.service.findById(id);
  }

  @Mutation('updateWorkoutWeek')
  async updateWorkout(
    @Args('id') id: string,
    @Args('workout') workout: IProgrammeWorkout,
  ): Promise<ProgrammeWorkout> {
    return this.service.update(id, workout);
  }

  @Mutation('deleteWorkoutWeek')
  async deleteWorkout(@Args('id') id: string): Promise<ProgrammeWorkout> {
    const WorkoutToDelete = await this.service.findById(id);
    await this.service.delete(id);

    return WorkoutToDelete;
  }
}
