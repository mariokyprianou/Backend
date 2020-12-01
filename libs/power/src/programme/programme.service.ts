import { Injectable } from '@nestjs/common';
import { IProgramme } from '../types';
import { ProgrammeImage } from './programme-image.model';
import { ProgrammeTranslation } from './programme-tr.model';
import { Programme } from './programme.model';

@Injectable()
export class ProgrammeService {
  // FIND ALL PROGRAMMES
  public findAll(language?: string) {
    return Programme.query()
      .withGraphJoined('[localisations, images]')
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
    await ProgrammeTranslation.query()
      .delete()
      .where('training_programme_id', id);
    await ProgrammeImage.query().delete().where('training_programme_id', id);
    return Programme.query().deleteById(id);
  }

  public async update(id: string, programme: IProgramme) {
    return Programme.query().upsertGraphAndFetch({ id: id, ...programme });
  }
}
