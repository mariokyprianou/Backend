import { ICmsParams } from '@lib/common';
import { applyPagination } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { raw, Transaction } from 'objection';
import { ScheduledWorkout } from './scheduled-workout.model';
import {
  IScheduledWorkout,
  ScheduledWorkoutFilter,
} from './scheduled-workout.interface';
import { WorkoutService } from '../workout';

interface FindByProgrammeParams {
  programmeId: string;
  weeks?: number[];
}
interface FindAllWorkoutsParams extends ICmsParams<ScheduledWorkoutFilter> {
  language?: string;
}

@Injectable()
export class ScheduledWorkoutService {
  constructor(private readonly workoutService: WorkoutService) {}

  public findById(id: string): Promise<ScheduledWorkout> {
    return this.baseQuery({ filter: { id } }).limit(1).first();
  }

  public findByProgrammeId(
    params: FindByProgrammeParams,
    opts: { transaction?: Transaction; includeWorkout?: boolean } = {},
  ) {
    const query = ScheduledWorkout.query(opts.transaction).where(
      'training_programme_workout.training_programme_id',
      params.programmeId,
    );

    if (opts.includeWorkout) {
      query
        .withGraphJoined('workout')
        .withGraphFetched('workout.localisations');
    }

    if (params.weeks) {
      query.whereIn('week_number', params.weeks);
    }

    return query;
  }

  public async findAll(params: FindAllWorkoutsParams) {
    const query = this.baseQuery(params);
    applyPagination(query, params);
    return await query;
  }

  private baseQuery(params: FindAllWorkoutsParams) {
    const query = ScheduledWorkout.query()
      .joinRelated('[programme,workout]')
      .whereNull('programme.deleted_at')
      .withGraphFetched(
        '[programme, workout.[localisations, exercises.[sets, localisations]]]',
      );

    if (params.filter) {
      if (params.filter.id) {
        query.findById(params.filter.id);
      }
      if (params.filter.ids) {
        query.findByIds(params.filter.ids);
      }
      if (params.filter.week) {
        query.where('week_number', params.filter.week);
      }
      if (params.filter.weeks) {
        query.whereIn('week_number', params.filter.weeks);
      }

      if (params.filter.environment) {
        query.where('programme.environment', params.filter.environment);
      }

      if (params.filter.name) {
        query
          .joinRaw(
            `LEFT JOIN workout_tr ON (workout.id = workout_tr.workout_id AND language = 'en')`,
          )
          .where(
            'workout_tr.name',
            'ilike',
            raw(`'%' || ? || '%'`, [params.filter.name]),
          );
      }

      if (params.filter.trainer) {
        query.where('programme.trainer_id', params.filter.trainer);
      }

      if (params.filter.programmeId) {
        query.where(
          'training_programme_workout.training_programme_id',
          params.filter.programmeId,
        );
      }
    }

    return query;
  }

  public async create(params: IScheduledWorkout) {
    const programmeWorkout = await ScheduledWorkout.transaction(
      async (transaction) => {
        const workout = await this.workoutService.createWorkout(params, {
          transaction,
        });

        return ScheduledWorkout.query(transaction)
          .insert({
            trainingProgrammeId: params.programme,
            weekNumber: params.weekNumber,
            orderIndex: params.orderIndex,
            workoutId: workout.id,
          })
          .returning('*');
      },
    );

    return this.findById(programmeWorkout.id);
  }

  public async findCount(params: FindAllWorkoutsParams) {
    const count = await this.baseQuery(params).resultSize();
    return { count };
  }

  public async updateWorkout(id: string, params: IScheduledWorkout) {
    // Ensure exists
    await ScheduledWorkout.query().select(1).findById(id).throwIfNotFound();

    await ScheduledWorkout.transaction(async (transaction) => {
      const workout = await this.workoutService.createWorkout(params, {
        transaction,
      });
      await ScheduledWorkout.query(transaction)
        .findById(id)
        .update({ workoutId: workout.id });
    });

    return this.findById(id);
  }

  public async deleteWorkout(id: string) {
    // Delete only the association to the programme
    // Keep the contents of the workout for historical purposes
    return ScheduledWorkout.query().deleteById(id);
  }
}
