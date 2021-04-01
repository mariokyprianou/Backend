import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { TrainerTranslation } from './trainer-tr.model';

@Injectable({ scope: Scope.REQUEST })
export class TrainerLoaders {
  public readonly findLocalisationsByTrainerId = new DataLoader<
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
}
