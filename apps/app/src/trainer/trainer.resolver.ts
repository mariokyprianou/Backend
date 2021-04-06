/* eslint-disable @typescript-eslint/no-unused-vars */
import { ProgrammeService } from '@lib/power/programme';
import { ProgrammeLoaders } from '@lib/power/programme/programme.loaders';
import { Trainer, TrainerTranslation } from '@lib/power/trainer';
import { TrainerLoaders } from '@lib/power/trainer/trainer.loaders';
import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TrainerService } from '../../../../libs/power/src/trainer/trainer.service';

@Resolver('Trainer')
export class TrainerResolver {
  constructor(
    private trainerService: TrainerService,
    private programmeLoaders: ProgrammeLoaders,
  ) {}

  @Query('getTrainers')
  async getTrainer(@Context('language') language: string) {
    return this.trainerService.findAll({
      language,
    });
  }

  @ResolveField('name')
  async name(
    @Parent() trainer: Trainer,
    @Context('language') language: string,
  ) {
    return trainer.getTranslation(language)?.name;
  }

  @ResolveField('programmes')
  async programmes(@Parent() trainer: Trainer) {
    return this.programmeLoaders.findByTrainerId.load(trainer.id);
  }
}
