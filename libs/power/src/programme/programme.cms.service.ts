import { Injectable } from '@nestjs/common';
import { ShareMediaEnum } from 'apps/app/src/shareMedia/shareMedia.resolver';
import { PartialModelGraph, QueryBuilder, Transaction } from 'objection';
import { ProgrammeEnvironment } from '../types';
import {
  CreateProgrammeParams,
  UpdateProgrammeParams,
} from './programme.interface';

import { Programme } from './programme.model';
import { ShareMediaTranslation } from './share-media-tr.model';
import { ShareMediaImage } from './share-media.interface';
import { ShareMedia } from './share-media.model';
import { ValidationError } from 'apollo-server-express';
import { ICmsParams } from '@lib/common';
import { ProgrammeFilter } from './programme.interface';
import { applyPagination } from '@lib/database';
import { OnDemandWorkout } from '../on-demand-workout';

const toShareImageModelGraph = (
  image: ShareMediaImage,
): PartialModelGraph<ShareMedia> => {
  const patch: PartialModelGraph<ShareMedia> = {
    id: image.id,
    type: image.type,
  };

  if (image.localisations) {
    patch.localisations = image.localisations.map<
      PartialModelGraph<ShareMediaTranslation>
    >((localisation) => ({
      language: localisation.language,
      imageKey: localisation.imageKey,
      colour: localisation.colour,
    }));
  }

  return patch;
};

async function ensureProgrammeTypeAvailable(params: {
  trainerId: string;
  environment: ProgrammeEnvironment;
}) {
  const programme = await Programme.query()
    .findOne({
      trainer_id: params.trainerId,
      environment: params.environment,
    })
    .whereNull('deleted_at');

  if (programme) {
    throw new ValidationError(
      'Trainer already has a programme for this environment.',
    );
  }
}

@Injectable()
export class ProgrammeService {
  // FIND ALL PROGRAMMES
  public async findAll(
    params: ICmsParams<ProgrammeFilter>,
  ): Promise<Programme[]> {
    const query = this.baseQuery(params);
    applyPagination(query, params);
    return await query;
  }

  private baseQuery(
    params: ICmsParams<ProgrammeFilter>,
  ): QueryBuilder<Programme> {
    const query = Programme.query().whereNull('training_programme.deleted_at');

    const { filter } = params;
    if (filter) {
      if (filter.id) {
        query.where('training_programme.id', filter.id);
      }

      if (filter.ids) {
        query.whereIn('training_programme.id', filter.ids);
      }

      if (filter.trainerId) {
        query.where('training_programme.trainer_id', filter.trainerId);
      }
      if (filter.environment) {
        query.where('training_programme.environment', filter.environment);
      }
    }

    return query.withGraphFetched(
      '[localisations, images, shareMediaImages.localisations]',
    );
  }

  public async findCount(params: ICmsParams<ProgrammeFilter>) {
    const count = await this.baseQuery(params).resultSize();
    return { count };
  }

  // CREATE PROGRAMME //
  public async create(programme: CreateProgrammeParams) {
    await ensureProgrammeTypeAvailable({
      trainerId: programme.trainerId,
      environment: programme.environment,
    });

    return Programme.transaction((trx) => {
      return Programme.query(trx).insertGraphAndFetch(programme);
    });
  }

  public findById(id: string): Promise<Programme> {
    return this.baseQuery({ filter: { id } })
      .withGraphFetched(
        '[localisations, images, shareMediaImages.localisations]',
      )
      .findById(id);
  }

  public async deleteProgrammesByTrainer(
    trainerId: string,
    opts: { transaction: Transaction },
  ) {
    const programmes = await Programme.query(opts.transaction)
      .select('id')
      .where('trainer_id', trainerId)
      .whereNull('deleted_at');

    await Promise.all(
      programmes.map((programme) =>
        this.deleteProgramme(programme.id, { transaction: opts.transaction }),
      ),
    );
  }

  public async deleteProgramme(
    trainingProgrammeId: string,
    opts: { transaction?: Transaction } = {},
  ) {
    let transaction = opts.transaction;
    if (!transaction) {
      transaction = await Programme.startTransaction();
    }

    try {
      const now = new Date();

      await Programme.query(transaction)
        .patch({ deletedAt: now })
        .where('id', trainingProgrammeId)
        .whereNull('deleted_at');

      await OnDemandWorkout.query(transaction)
        .whereIn(
          'id',
          OnDemandWorkout.query()
            .select('on_demand_workout.id')
            .joinRelated('workout')
            .where('workout.training_programme_id', trainingProgrammeId),
        )
        .delete();

      await Programme.relatedQuery('scheduledWorkouts', transaction)
        .for(trainingProgrammeId)
        .delete();

      await Programme.relatedQuery('challenges', transaction)
        .for(trainingProgrammeId)
        .whereNull('deleted_at')
        .patch({ deletedAt: now });

      if (!opts.transaction) {
        await transaction.commit();
      }
    } catch (e) {
      if (!opts.transaction) {
        await transaction.rollback();
      }
      throw e;
    }
  }

  public async updateProgramme(
    trainingProgrammeId: string,
    params: UpdateProgrammeParams,
  ): Promise<Programme> {
    const programme = await Programme.query()
      .findById(trainingProgrammeId)
      .whereNull('deleted_at')
      .throwIfNotFound();

    const isTrainerUpdated =
      params.trainerId && programme.trainerId !== params.trainerId;
    const isEnvironmentUpdated =
      params.environment && programme.environment !== params.environment;
    if (isTrainerUpdated || isEnvironmentUpdated) {
      await ensureProgrammeTypeAvailable({
        trainerId: programme.trainerId,
        environment: params.environment,
      });
    }

    const patch: PartialModelGraph<Programme> = {
      id: programme.id,
      trainerId: params.trainerId,
      fatLoss: params.fatLoss,
      fitness: params.fitness,
      wellness: params.wellness,
      muscle: params.muscle,
      environment: params.environment,
      status: params.status,
      weeksAvailable: params.weeksAvailable,
    };

    if (params.images) {
      patch.images = params.images;
    }

    if (params.localisations) {
      patch.localisations = params.localisations;
    }

    if (params.shareMediaImages) {
      patch.shareMediaImages = params.shareMediaImages.map(
        toShareImageModelGraph,
      );
    }

    return Programme.transaction((trx) => {
      return Programme.query(trx).upsertGraphAndFetch(patch);
    });
  }

  public findAllShareMedia(programmeId: string, language?: string) {
    return ShareMedia.query()
      .where('training_programme_id', programmeId)
      .withGraphFetched('localisations')
      .modifyGraph('localisations', (qb) =>
        language ? qb.where('language', language) : qb,
      );
  }

  public async findShareMedia(programmeId: string, type: ShareMediaEnum) {
    // Search only 'en' language as this function is for the un-localized
    // version of share media ie. not programme start
    // return a randomly selected share media image
    const result = await ShareMedia.query()
      .where('training_programme_id', programmeId)
      .andWhere('type', type)
      .orderByRaw('random()')
      .withGraphJoined('localisations')
      .modifyGraph('localisations', (qb) => qb.where('language', 'en'))
      .limit(1);
    return result[0];
  }
}
