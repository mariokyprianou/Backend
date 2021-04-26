/* eslint-disable @typescript-eslint/no-unused-vars */
import { ProgrammeLoaders } from '@lib/power/programme/programme.loaders';
import { Trainer, TrainerService } from '@lib/power';
import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

@Resolver('Trainer')
export class TrainerResolver {
  constructor(
    private trainerService: TrainerService,
    private programmeLoaders: ProgrammeLoaders,
  ) {}

  @Query('getTrainers')
  async getTrainers(@Context('language') language: string) {
    return this.trainerService.findAll({ language });
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
    return this.programmeLoaders.findActiveByTrainerId.load(trainer.id);
  }
}
