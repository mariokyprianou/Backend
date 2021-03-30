/* eslint-disable @typescript-eslint/no-unused-vars */
import { ProgrammeService } from '@lib/power/programme';
import { Trainer } from '@lib/power/trainer';
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
    private programmeService: ProgrammeService,
  ) {}

  @Query('getTrainers')
  async getTrainer(@Context('language') language: string) {
    return this.trainerService.findAll({
      language,
    });
  }

  @ResolveField('name')
  name(@Parent() trainer: Trainer, @Context('language') language: string) {
    return trainer.getTranslation(language)?.name;
  }

  @ResolveField('programmes')
  async programmes(
    @Parent() trainer: Trainer,
    @Context('language') language: string,
  ) {
    const relatedProgrammes = await this.programmeService
      .findAll(language)
      .where('trainer_id', trainer.id)
      .andWhere('status', 'PUBLISHED');

    return relatedProgrammes;
  }
}
