import { Trainer } from '@lib/power/trainer';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TrainerService } from '@lib/power/trainer/trainer.service';
import { TrainerFilter, ListMetadata, TrainerLocalisation } from '@lib/power';
import { CmsParams } from '@lib/common';

@Resolver('Trainer')
export class TrainerResolver {
  constructor(private trainerService: TrainerService) {}

  @Query('_allTrainersMeta')
  async _allTrainersMeta(
    @Context('language') language: string,
    @Args() params: CmsParams<TrainerFilter>,
  ): Promise<ListMetadata> {
    const { count } = await this.trainerService.findTrainerCount({
      language,
      page: params.page,
      perPage: params.perPage,
      filter: params.filter,
      sortField: params.sortField,
      sortOrder: params.sortOrder,
    });
    return { count };
  }

  @Query('allTrainers')
  async allTrainers(
    @Context('language') language: string,
    @Args() params: CmsParams<TrainerFilter>,
  ): Promise<Trainer[]> {
    const trainers = await this.trainerService.findAll({
      language,
      page: params.page,
      perPage: params.perPage,
      filter: params.filter,
      sortField: params.sortField,
      sortOrder: params.sortOrder,
    });

    return trainers;
  }

  @Query('Trainer')
  async Trainer(@Args('id') id: string): Promise<Trainer> {
    return this.trainerService.findById(id);
  }

  @Mutation('createTrainer')
  async createTrainer(
    @Args('localisations') localisations: TrainerLocalisation[] = [],
  ): Promise<Trainer> {
    return this.trainerService.createTrainer(localisations);
  }

  @Mutation('updateTrainer')
  async updateTrainer(
    @Args('id') id: string,
    @Args('localisations') localisations: TrainerLocalisation[],
  ): Promise<Trainer> {
    return this.trainerService.updateTrainer(id, localisations);
  }

  @Mutation('deleteTrainer')
  async deleteTrainer(@Args('id') id: string): Promise<Trainer> {
    // const trainerToDelete = await this.trainerService.findById(id);
    // await this.trainerService.deleteTrainer(id);

    return this.trainerService.deleteTrainer(id);
  }
}
