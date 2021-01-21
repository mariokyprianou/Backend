import { Injectable } from '@nestjs/common';
import { Exercise } from './exercise.model';
import { ExerciseTranslation } from './exercise-tr.model';
import { ExerciseLocalisation, IExercise } from '../types';

@Injectable()
export class ExerciseService {
  // FIND ALL Exercise

  // TODO filter deleted
  public findAll(language?: string) {
    return Exercise.query()
      .whereNull('exercise.deleted_at')
      .withGraphJoined('localisations')
      .modifyGraph('localisations', (qb) =>
        language ? qb.where('language', language) : qb,
      );
  }

  public count() {
    return Exercise.query().count().whereNull('exercise.deleted_at');
  }

  public findById(id: string, language?: string) {
    return this.findAll(language).findById(id);
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
