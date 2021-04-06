import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { TrainerTranslation } from './trainer-tr.model';
import { Trainer } from './trainer.model';

@Injectable({ scope: Scope.REQUEST })
export class TrainerLoaders {
  public readonly findLocalisationsById = new DataLoader<
    string,
    TrainerTranslation[]
  >(async (trainerIds) => {
    const translations = await TrainerTranslation.query().whereIn(
      'trainer_id',
      trainerIds as string[],
    );
    return trainerIds.map((trainerId) =>
      translations.filter((translation) => translation.trainerId === trainerId),
    );
  });

  public readonly findById = new DataLoader<string, Trainer>(
    async (trainerIds) => {
      const trainers = await Trainer.query().findByIds(trainerIds as string[]);
      return trainerIds.map((trainerId) =>
        trainers.find((trainer) => trainer.id === trainerId),
      );
    },
  );
}
