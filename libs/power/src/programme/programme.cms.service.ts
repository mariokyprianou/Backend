import { Injectable } from '@nestjs/common';
import { ShareMediaEnum } from 'apps/app/src/shareMedia/shareMedia.resolver';
import { PartialModelGraph, QueryBuilder } from 'objection';
import { IProgramme, ProgrammeEnvironment } from '../types';
import { UpdateProgrammeParams } from './programme.interface';

import { Programme } from './programme.model';
import { ShareMediaTranslation } from './share-media-tr.model';
import { ShareMediaImage } from './share-media.interface';
import { ShareMedia } from './share-media.model';
import { ValidationError } from 'apollo-server-errors';
import { ICmsParams } from '@lib/common';
import { ProgrammeFilter } from './programme.interface';
import { applyPagination } from '@lib/database';

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
  public async create(programme: IProgramme) {
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

  public async delete(id: string) {
    // delete translations
    // const mediaToDelete = await ShareMedia.query().where(
    //   'training_programme_id',
    //   id,
    // );
    // await ShareMediaTranslation.query()
    //   .del()
    //   .whereIn(
    //     'share_media_image_id',
    //     mediaToDelete.map((each) => each.id),
    //   );
    // await ShareMedia.query().del().where('training_programme_id', id);
    // await ProgrammeTranslation.query()
    //   .delete()
    //   .where('training_programme_id', id);
    // await ProgrammeImage.query().delete().where('training_programme_id', id);
    // return Programme.query().deleteById(id);

    // Soft delete
    return Programme.query().patchAndFetchById(id, { deletedAt: new Date() });
  }

  public async updateProgramme(
    params: UpdateProgrammeParams,
  ): Promise<Programme> {
    const programme = await Programme.query()
      .findById(params.id)
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
      muscle: params.muscle,
      environment: params.environment,
      status: params.status,
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

  public findShareMedia(programmeId: string, type: ShareMediaEnum) {
    // Search only 'en' language as this function is for the un-localized
    // version of share media ie. not programme start
    return ShareMedia.query()
      .first()
      .where('training_programme_id', programmeId)
      .andWhere('type', type)
      .withGraphFetched('localisations')
      .modifyGraph('localisations', (qb) => qb.where('language', 'en'));
  }
}
