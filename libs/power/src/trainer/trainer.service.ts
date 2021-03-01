import { Injectable } from '@nestjs/common';
import { Trainer } from './trainer.model';
// import { TrainerTranslation } from './trainer-tr.model';
import { TrainerLocalisation } from '../types';

@Injectable()
export class TrainerService {
  // FIND ALL TRAINERS //
  // Can be used in cms for chaining filters.
  public findAll(language?: string) {
    return Trainer.query()
      .whereNull('trainer.deleted_at')
      .withGraphJoined('localisations')
      .modifyGraph('localisations', (qb) =>
        language ? qb.where('language', language) : qb,
      );
  }

  public count() {
    return Trainer.query().count().whereNull('trainer.deleted_at');
  }

  // FIND SINGLE TRAINER //
  public findById(id: string, language?: string) {
    return this.findAll(language).findById(id);
  }

  // DELETE TRAINER //
  public async deleteTrainer(trainerId: string) {
    // await TrainerTranslation.query().delete().where('trainer_id', trainerId);
    // return Trainer.query().deleteById(trainerId);
    // set deleted_at flag
    await Trainer.query().patchAndFetchById(trainerId, {
      deletedAt: new Date(),
    });

    return this.findById(trainerId);
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
