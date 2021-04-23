import {
  Trainer,
  TrainerCmsService,
  TrainerTranslation,
} from '@lib/power/trainer';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TrainerFilter, ListMetadata, TrainerLocalisation } from '@lib/power';
import { CmsParams } from '@lib/common';
import { TrainerLoaders } from '@lib/power/trainer/trainer.loaders';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver('Trainer')
export class TrainerResolver {
  constructor(
    private trainerService: TrainerCmsService,
    private trainerLoaders: TrainerLoaders,
  ) {}

  @ResolveField('localisations')
  async getLocalisations(
    @Parent() trainer: Trainer,
  ): Promise<TrainerTranslation[]> {
    return this.trainerLoaders.findLocalisationsById.load(trainer.id);
  }

  @Query('_allTrainersMeta')
  async _allTrainersMeta(
    @Args() params: CmsParams<TrainerFilter>,
  ): Promise<ListMetadata> {
    const { count } = await this.trainerService.findTrainerCount({
      language: 'en',
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
    @Args() params: CmsParams<TrainerFilter>,
  ): Promise<Trainer[]> {
    const trainers = await this.trainerService.findAll({
      language: 'en',
      page: params.page,
      perPage: params.perPage,
      filter: params.filter,
      sortField: params.sortField,
      sortOrder: params.sortOrder,
    });

    return trainers;
  }

  @Query('Trainer')
  async Trainer(@Args('id', ParseUUIDPipe) id: string): Promise<Trainer> {
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
    @Args('id', ParseUUIDPipe) id: string,
    @Args('localisations') localisations: TrainerLocalisation[],
  ): Promise<Trainer> {
    return this.trainerService.updateTrainer(id, localisations);
  }

  @Mutation('deleteTrainer')
  async deleteTrainer(@Args('id', ParseUUIDPipe) id: string): Promise<Trainer> {
    return this.trainerService.deleteTrainer(id);
  }
}
