import { Injectable } from '@nestjs/common';
import { Trainer } from './trainer.model';
import { TrainerLocalisation } from '../types';
import { TrainerFilter } from './trainer.interface';
import { applyPagination } from '@lib/database';
import { ICmsParams } from '@lib/common';
import { TrainerTranslation } from './trainer-tr.model';
import { raw } from 'objection';

interface TrainerQueryParams extends ICmsParams<TrainerFilter> {
  language?: string;
}

function baseQuery(params: TrainerQueryParams) {
  const query = Trainer.query()
    .withGraphFetched('localisations')
    .whereNull('trainer.deleted_at');

  if (params.language) {
    query.modifyGraph('localisations', (qb) =>
      qb.where('language', params.language),
    );
  }

  if (params.filter) {
    const { filter } = params;
    if (filter.id) {
      query.findByIds([filter.id]);
    }

    if (filter.ids) {
      query.whereIn('trainer.id', filter.ids);
    }

    if (filter.name) {
      query.whereIn(
        'trainer.id',
        TrainerTranslation.query()
          .select('trainer_id')
          .where('name', 'ilike', raw(`'%' || ?|| '%'`, filter.name)),
      );
    }
  }

  applyPagination(query, params);

  return query;
}

@Injectable()
export class TrainerService {
  // FIND ALL TRAINERS //
  // Can be used in cms for chaining filters.
  public findAll(params: TrainerQueryParams) {
    const query = baseQuery(params);
    return query;
  }

  public async findTrainerCount(params: TrainerQueryParams) {
    const count = await baseQuery(params).resultSize();
    return { count };
  }

  // FIND SINGLE TRAINER //
  public async findById(id: string, language?: string): Promise<Trainer> {
    return await baseQuery({
      language,
      filter: { id },
    })
      .limit(1)
      .first();
  }

  // DELETE TRAINER //
  public async deleteTrainer(trainerId: string) {
    // await TrainerTranslation.query().delete().where('trainer_id', trainerId);
    // return Trainer.query().deleteById(trainerId);
    // set deleted_at flag

    return Trainer.query().patchAndFetchById(trainerId, {
      deletedAt: new Date(),
    });
  }

  // UPDATE TRAINER //
  public async updateTrainer(
    trainerId: string,
    localisation: TrainerLocalisation[],
  ) {
    return Trainer.query().upsertGraphAndFetch({
      id: trainerId,
      localisations: localisation,
    });
  }

  // CREATE TRAINER //
  public async createTrainer(localisations: TrainerLocalisation[]) {
    return Trainer.query().insertGraphAndFetch({
      localisations: localisations.map((localisation) => {
        return {
          language: localisation.language,
          name: localisation.name,
        };
      }),
    });
  }
}
