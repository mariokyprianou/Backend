import { ICmsParams } from '@lib/common';
import { applyPagination } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { ListMetadata } from '../types';
import { WorkoutService } from '../workout';
import { CreateOnDemandWorkoutDto } from './dto';
import { OnDemandWorkoutFilter } from './on-demand-workout.interface';
import { OnDemandWorkout } from './on-demand-workout.model';

@Injectable()
export class OnDemandWorkoutCmsService {
  constructor(private readonly workoutService: WorkoutService) {}

  private baseQuery(params: ICmsParams<OnDemandWorkoutFilter> = {}) {
    const query = OnDemandWorkout.query()
      .withGraphJoined('workout')
      .withGraphFetched('workout.localisations');

    if (params?.filter) {
      if (params.filter.id) {
        query.findById(params.filter.id);
      }
      if (params.filter.ids) {
        query.findByIds(params.filter.ids);
      }
    }

    return query;
  }

  public async findById(id: string): Promise<OnDemandWorkout> {
    return this.baseQuery().findById(id).throwIfNotFound();
  }

  public async findAll(
    params: ICmsParams<OnDemandWorkoutFilter>,
  ): Promise<OnDemandWorkout[]> {
    const query = this.baseQuery(params);
    applyPagination(query, params);
    return query;
  }

  public async findCount(
    params: ICmsParams<OnDemandWorkoutFilter>,
  ): Promise<ListMetadata> {
    const query = this.baseQuery(params);
    const count = await query.resultSize();
    return { count };
  }

  public async create(params: CreateOnDemandWorkoutDto) {
    const workoutId = await OnDemandWorkout.transaction(async (transaction) => {
      const workout = await this.workoutService.createWorkout(params, {
        transaction,
      });
      const onDemandWorkout = await OnDemandWorkout.query(transaction).insert({
        workoutId: workout.id,
      });
      return onDemandWorkout.id;
    });

    return this.findById(workoutId);
  }

  public async update(id: string, params: CreateOnDemandWorkoutDto) {
    const onDemandWorkout = await OnDemandWorkout.query()
      .findById(id)
      .throwIfNotFound();

    await OnDemandWorkout.transaction(async (transaction) => {
      const workout = await this.workoutService.createWorkout(params, {
        transaction,
      });

      await onDemandWorkout
        .$query(transaction)
        .patch({ workoutId: workout.id });
    });

    return this.findById(id);
  }

  public async delete(id: string) {
    const workout = await this.findById(id);
    await workout.$query().delete();
    return workout;
  }
}
