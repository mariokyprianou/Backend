import { ICmsParams } from '@lib/common';
import { applyPagination } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { raw, Transaction } from 'objection';
import { IProgrammeWorkout, SetType } from '../types';
import { ProgrammeWorkout } from './programme-workout.model';
import { WorkoutFilter } from './workout.interface';
import { Workout } from './workout.model';

export interface FindByProgrammeParams {
  programmeId: string;
  weeks?: number[];
}
interface FindAllWorkoutsParams extends ICmsParams<WorkoutFilter> {
  language?: string;
}

@Injectable()
export class WorkoutService {
  private async createWorkout(trx: Transaction, params: IProgrammeWorkout) {
    return Workout.query(trx).insertGraph({
      isContinuous: params.isContinuous,
      trainingProgrammeId: params.programme,
      overviewImageKey: params.overviewImageKey,
      intensity: params.intensity,
      duration: params.duration,
      localisations: params.localisations,
      exercises: params.exercises.map((exercise) => ({
        exerciseId: exercise.exercise,
        setType: exercise.setType,
        orderIndex: exercise.orderIndex,
        localisations: exercise.localisations,
        sets: exercise.sets.map((set) => ({
          setNumber: set.setNumber,
          quantity: set.quantity,
          restTime: set.restTime,
        })),
      })),
    });
  }

  public findById(id: string): Promise<ProgrammeWorkout> {
    return this.baseQuery({
      filter: { id },
    })
      .limit(1)
      .first();
  }

  public findByProgrammeId(
    params: FindByProgrammeParams,
    opts: { transaction?: Transaction; includeWorkout?: boolean } = {},
  ) {
    const query = ProgrammeWorkout.query(opts.transaction).where(
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
    const query = ProgrammeWorkout.query()
      .withGraphFetched(
        '[programme, workout.[localisations, exercises.[sets, localisations]]]',
      )
      .joinRelated('[programme,workout]')
      .joinRaw(
        `LEFT JOIN workout_tr ON (workout.id = workout_tr.workout_id AND language = 'en')`,
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
        query.where(
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

  public async create(params: IProgrammeWorkout) {
    if (params.isContinuous) {
      ensureExercisesAreTimeBased(params);
    }

    const programmeWorkout = await ProgrammeWorkout.transaction(async (trx) => {
      const workout = await this.createWorkout(trx, params);
      return ProgrammeWorkout.query(trx)
        .insert({
          trainingProgrammeId: params.programme,
          weekNumber: params.weekNumber,
          orderIndex: params.orderIndex,
          workoutId: workout.id,
        })
        .returning('*');
    });

    return this.findById(programmeWorkout.id);
  }

  public async findCount(params: FindAllWorkoutsParams) {
    const count = await this.baseQuery(params).resultSize();
    return { count };
  }

  public async update(id: string, params: IProgrammeWorkout) {
    if (params.isContinuous) {
      ensureExercisesAreTimeBased(params);
    }

    // Ensure exists
    await ProgrammeWorkout.query().select(1).findById(id).throwIfNotFound();

    await ProgrammeWorkout.transaction(async (trx) => {
      const workout = await this.createWorkout(trx, params);
      await ProgrammeWorkout.query(trx)
        .findById(id)
        .update({ workoutId: workout.id });
    });

    return this.findById(id);
  }

  public async delete(id: string) {
    // Delete only the association to the programme
    // Keep the contents of the workout for historical purposes
    return ProgrammeWorkout.query().deleteById(id);
  }
}

function ensureExercisesAreTimeBased(params: IProgrammeWorkout) {
  for (const exercise of params.exercises) {
    if (exercise.setType !== SetType.TIME) {
      throw new Error(
        'All exercises must be time-based in a continuous workout.',
      );
    }
  }
}
