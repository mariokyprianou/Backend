import { Trainer } from '@lib/power/trainer';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TrainerService } from '@lib/power/trainer/trainer.service';
import { Filter, ListMetadata, TrainerLocalisation } from '@lib/power/types';
import { constructLimits } from '../constructLimits';

interface TrainerFilter extends Filter {
  name: string;
}

@Resolver('Trainer')
export class TrainerResolver {
  constructor(private trainerService: TrainerService) {}

  constructFilters = (query: any, filter: TrainerFilter) => {
    if (filter) {
      if (filter.id) {
        query.findByIds([filter.id]);
      }

      if (filter.ids) {
        query.whereIn('trainer.id', filter.ids);
      }

      if (filter.name) {
        query.where('trainer.localisations.name', 'ilike', `%${filter.name}%`);
      }
    }

    return query;
  };

  @Query('_allTrainersMeta')
  async _allTrainersMeta(
    @Args('filter') filter: TrainerFilter,
  ): Promise<ListMetadata> {
    const [count] = await this.constructFilters(
      this.trainerService.count(),
      filter,
    );
    return count;
  }

  @Query('allTrainers')
  async allTrainers(
    @Context('language') language: string,
    @Args('page') page: number,
    @Args('perPage') perPage: number,
    @Args('sortField') sortField: string,
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' | null,
    @Args('filter') filter: TrainerFilter,
  ): Promise<Trainer[]> {
    return this.constructFilters(
      constructLimits(this.trainerService.findAll(language), {
        page,
        perPage,
        sortField,
        sortOrder,
      }),
      filter,
    );
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
