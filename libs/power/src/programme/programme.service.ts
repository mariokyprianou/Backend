import { Injectable } from '@nestjs/common';
import { ShareMediaEnum } from 'apps/app/src/shareMedia/shareMedia.resolver';
import { PartialModelGraph } from 'objection';
import { IProgramme } from '../types';
import { UpdateProgrammeParams } from './programme.interface';

import { Programme } from './programme.model';
import { ShareMediaTranslation } from './share-media-tr.model';
import { ShareMediaImage } from './share-media.interface';
import { ShareMedia } from './share-media.model';

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

@Injectable()
export class ProgrammeService {
  // FIND ALL PROGRAMMES
  public findAll(language?: string) {
    return Programme.query()
      .whereNull('training_programme.deleted_at')
      .withGraphFetched(
        '[localisations, images, shareMediaImages.localisations]',
      )
      .modifyGraph('localisations', (qb) =>
        language ? qb.where('language', language) : qb,
      );
  }

  public count() {
    return Programme.query().count().whereNull('training_programme.deleted_at');
  }

  // CREATE PROGRAMME //
  public async create(programme: IProgramme) {
    return Programme.transaction((trx) => {
      return Programme.query(trx).insertGraphAndFetch(programme);
    });
  }

  public findById(id: string, language?: string) {
    return this.findAll(language).findById(id);
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
      .throwIfNotFound();

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
