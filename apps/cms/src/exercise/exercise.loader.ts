import { Exercise, ExerciseService } from '@lib/power/exercise';
import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class ExerciseLoaders {
  constructor(private readonly exerciseService: ExerciseService) {}

  public readonly findById = new DataLoader<string, Exercise>(
    async (exerciseIds) => {
      const exercises = await this.exerciseService.findAll({
        filter: { ids: exerciseIds as string[] },
      });

      return exerciseIds.map((id) => exercises.find((e) => e.id === id));
    },
  );
}
