import { Injectable } from '@nestjs/common';
import { Trainer } from './trainer.model';

@Injectable()
export class TrainerService {
  public findAll(params: { language: string }): Promise<Trainer[]> {
    const query = Trainer.query()
      .where('localisations.language', params.language)
      .whereNull('trainer.deleted_at')
      .withGraphJoined('localisations')
      .orderBy('localisations.name');

    return query;
  }
}
