import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { PublishStatus } from '../types';
import { ProgrammeImage } from './programme-image.model';
import { Programme } from './programme.model';
import { ShareMedia } from './share-media.model';

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

  public findImagesByProgrammeId = new DataLoader<string, ProgrammeImage[]>(
    async (programmeIds) => {
      const images = await ProgrammeImage.query().whereIn(
        'training_programme_id',
        programmeIds as string[],
      );

      return programmeIds.map((programmeId) =>
        images.filter((image) => image.trainingProgrammeId === programmeId),
      );
    },
  );

  public findShareMediaByProgrammeId = new DataLoader<string, ShareMedia[]>(
    async (programmeIds) => {
      const images = await ShareMedia.query()
        .whereIn('training_programme_id', programmeIds as string[])
        .withGraphFetched('localisations');

      return programmeIds.map((programmeId) =>
        images.filter((image) => image.trainingProgrammeId === programmeId),
      );
    },
  );
}
