import { Injectable } from '@nestjs/common';
import { Trainer } from './trainer.model';
import { TrainerLocalisation } from '../types';
import { TrainerFilter } from './trainer.interface';
import { applyPagination } from '@lib/database';
import { ICmsParams } from '@lib/common';
import { TrainerTranslation } from './trainer-tr.model';
import { ProgrammeService } from '../programme';
import { raw } from 'objection';

interface TrainerQueryParams extends ICmsParams<TrainerFilter> {
  language?: string;
}

function baseQuery(params: TrainerQueryParams) {
  const query = Trainer.query()
    .joinRaw(
      `left join trainer_tr on (
        trainer.id = trainer_tr.trainer_id AND 
        trainer_tr.language = 'en'
      )`,
    )
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

  applyPagination(query, {
    page: params.page ?? 0,
    perPage: params.perPage ?? 25,
    sortField: 'name',
    sortOrder: params.sortOrder,
  });

  return query;
}

@Injectable()
export class TrainerCmsService {
  constructor(private readonly programmeService: ProgrammeService) {}

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
      .first()
      .throwIfNotFound();
  }

  // DELETE TRAINER //
  public async deleteTrainer(trainerId: string) {
    const trainer = await this.findById(trainerId);
    await Trainer.transaction(async (transaction) => {
      await this.programmeService.deleteProgrammesByTrainer(trainerId, {
        transaction,
      });
      await trainer
        .$relatedQuery('exercises', transaction)
        .patch({ deletedAt: new Date() });
      await trainer.$query(transaction).patch({ deletedAt: new Date() });
    });
    return trainer;
  }

  // UPDATE TRAINER //
  public async updateTrainer(
    trainerId: string,
    localisations: TrainerLocalisation[],
  ) {
    const trainer = await this.findById(trainerId);
    return trainer.$query().upsertGraphAndFetch({
      id: trainerId,
      localisations,
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
