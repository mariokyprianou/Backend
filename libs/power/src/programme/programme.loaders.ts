import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { PublishStatus } from '../types';
import { Programme } from './programme.model';

@Injectable({ scope: Scope.REQUEST })
export class ProgrammeLoaders {
  public readonly findByTrainerId = new DataLoader<string, Programme[]>(
    async (trainerIds) => {
      const programmes = await Programme.query()
        .whereIn('trainer_id', trainerIds as string[])
        .andWhere('status', PublishStatus.PUBLISHED)
        .withGraphFetched('localisations');

      return trainerIds.map((trainerId) =>
        programmes.filter((programme) => programme.trainerId === trainerId),
      );
    },
  );
}
