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
export class ExerciseService {
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
    // delete translations
    // await ExerciseTranslation.query().delete().where('exercise_id', id);
    // return Exercise.query().deleteById(id);

    return Exercise.query().patchAndFetchById(id, { deletedAt: new Date() });
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
