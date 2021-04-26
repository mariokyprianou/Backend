import { Injectable } from '@nestjs/common';
import { Exercise } from './exercise.model';
import { ExerciseLocalisation, IExercise } from '../types';
import { ICmsParams } from '@lib/common';
import { ExerciseFilter } from './exercise.interface';
import { applyPagination } from '@lib/database';
import { ExerciseTranslation } from './exercise-tr.model';
import { raw } from 'objection';

interface FindExerciseParams extends ICmsParams<ExerciseFilter> {
  language?: string;
}

function baseQuery(params: FindExerciseParams = {}) {
  const query = Exercise.query()
    .whereNull('exercise.deleted_at')
    .withGraphFetched('[localisations, category]');

  if (params.language) {
    query.modifyGraph('localisations', (qb) =>
      qb.where({ language: params.language }),
    );
  }

  if (params.filter) {
    const { filter } = params;
    if (filter.id) {
      query.findByIds([filter.id]);
    }

    if (filter.ids) {
      query.findByIds(filter.ids);
    }

    if (filter.name) {
      query.whereIn(
        'exercise.id',
        ExerciseTranslation.query()
          .select('exercise_id')
          .where('name', 'ilike', raw(`'%' || ? || '%'`, filter.name)),
      );
    }

    if (filter.trainer) {
      query.where('trainer_id', filter.trainer);
    }
  }
  return query;
}

function joinSortColumn(params: FindExerciseParams, query) {
  let sortField = null;
  if (params.sortField) {
    if (params.sortField === 'name') {
      query.joinRaw(
        `LEFT JOIN exercise_tr ON (exercise.id = exercise_tr.exercise_id AND language = 'en')`,
      );
      sortField = 'exercise_tr.name';
    } else if (params.sortField === 'trainer') {
      query
        .joinRelated('trainer')
        .joinRaw(
          `LEFT JOIN trainer_tr ON (trainer.id = trainer_tr.trainer_id AND language = 'en')`,
        );
      sortField = 'trainer_tr.name';
    }
  }

  return sortField;
}

@Injectable()
export class ExerciseCmsService {
  // FIND ALL Exercise

  public async findAll(params: FindExerciseParams): Promise<Exercise[]> {
    const query = baseQuery(params);

    const sortField = joinSortColumn(params, query);

    applyPagination(query, {
      page: params.page,
      perPage: params.perPage,
      sortField,
      sortOrder: params.sortOrder,
    });

    return await query;
  }

  public async findCount(params: FindExerciseParams) {
    const count = await baseQuery(params).resultSize();
    return { count };
  }

  public findById(id: string, language?: string) {
    return baseQuery({ filter: { id }, language }).limit(1).first();
  }

  public async delete(id: string) {
    const exercise = await Exercise.query().findById(id).throwIfNotFound();
    if (exercise.deletedAt !== null) {
      return exercise;
    }

    await this.ensureExerciseIsInactive(exercise);

    return Exercise.query().patchAndFetchById(id, { deletedAt: new Date() });
  }

  private async ensureExerciseIsInactive(exercise: Exercise) {
    const db = Exercise.knex();

    const scheduledWorkouts = db
      .count('* as count')
      .from('training_programme')
      .join(
        'training_programme_workout',
        'training_programme.id',
        'training_programme_workout.training_programme_id',
      )
      .join('workout', 'training_programme_workout.workout_id', 'workout.id')
      .join('workout_exercise', 'workout.id', 'workout_exercise.workout_id')
      .where('workout_exercise.exercise_id', exercise.id);

    const onDemandWorkouts = db
      .count('* as count')
      .from('training_programme')
      .join(
        'on_demand_workout',
        'training_programme.id',
        'on_demand_workout.training_programme_id',
      )
      .join('workout', 'on_demand_workout.workout_id', 'workout.id')
      .join('workout_exercise', 'workout.id', 'workout_exercise.workout_id')
      .where('workout_exercise.exercise_id', exercise.id);

    // Ensure exercise is not attached to any active workouts
    const { count } = await db
      .sum('workouts.count as count')
      .from(scheduledWorkouts.union(onDemandWorkouts).as('workouts'))
      .first();

    if (count > 0) {
      throw new Error(
        `Unable to delete exercise, it is in use by ${count} on-demand/scheduled workouts.`,
      );
    }
  }

  public async update(
    exerciseId: string,
    exercise: IExercise,
    localisations: ExerciseLocalisation[],
  ) {
    return Exercise.query().upsertGraphAndFetch({
      id: exerciseId,
      ...exercise,
      localisations,
    });
  }

  public async create(
    exercise: IExercise,
    localisations: ExerciseLocalisation[],
  ) {
    return Exercise.query().insertGraphAndFetch({
      ...exercise,
      localisations,
    });
  }

  public async updateVideo(videoKey: string, videoValue: string) {
    return Exercise.query().update({
      [videoKey]: videoValue,
    });
  }
}
