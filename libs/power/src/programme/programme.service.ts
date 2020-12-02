import { Injectable } from '@nestjs/common';
import { IProgramme, IShareMedia, ShareMediaType } from '../types';
import { ProgrammeImage } from './programme-image.model';
import { ProgrammeTranslation } from './programme-tr.model';
import { Programme } from './programme.model';
import { ShareMediaTranslation } from './share-media-tr.model';
import { ShareMedia } from './share-media.model';

@Injectable()
export class ProgrammeService {
  // FIND ALL PROGRAMMES
  public findAll(language?: string) {
    return Programme.query()
      .withGraphJoined('[localisations, images, shareMediaImages.[localisations]]')
      .modifyGraph('localisations', (qb) =>
        language ? qb.where('language', language) : qb,
      );
  }

  public count() {
    return Programme.query().count();
  }

  // CREATE PROGRAMME //
  public async create(programme: IProgramme) {
    return Programme.query().insertGraphAndFetch(programme);
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public async delete(id: string) {
    // delete translations
    const mediaToDelete = await ShareMedia.query().where(
      'training_programme_id',
      id,
    );
    await ShareMediaTranslation.query()
      .del()
      .whereIn(
        'share_media_image_id',
        mediaToDelete.map((each) => each.id),
      );
    await ShareMedia.query().del().where('training_programme_id', id);
    await ProgrammeTranslation.query()
      .delete()
      .where('training_programme_id', id);
    await ProgrammeImage.query().delete().where('training_programme_id', id);
    return Programme.query().deleteById(id);
  }

  public async update(id: string, programme: IProgramme) {
    return Programme.query().upsertGraphAndFetch({ id: id, ...programme });
  }

  public async createShareMedia(programme: string, shareMedia: IShareMedia) {
    await ShareMedia.query().insertGraphAndFetch({
      ...shareMedia,
      trainingProgrammeId: programme,
    });
    return this.findById(programme);
  }

  public async updateShareMedia(
    programme: string,
    id: string,
    shareMedia: IShareMedia,
  ) {
    await ShareMedia.query().upsertGraphAndFetch({
      id,
      ...shareMedia,
      trainingProgrammeId: programme,
    });
    return this.findById(programme);
  }

  public findAllShareMedia(programme: string, language?: string) {
    return ShareMedia.query()
      .where('training_program_id', programme)
      .withGraphJoined('localisations')
      .modifyGraph('localisations', (qb) =>
        language ? qb.where('language', language) : qb,
      );
  }
}
