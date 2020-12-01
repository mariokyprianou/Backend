import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { constructLimits } from '../constructLimits';
import { Filter, ListMetadata } from '@lib/power/types';
import { ExerciseCategory } from '@lib/power/exercise-category';
import { ExerciseCategoryService } from '@lib/power/exercise-category/exercise-category.service';

interface ExerciseCategoryFilter extends Filter {
  name: string;
}

@Resolver('ExerciseCategory')
export class ExerciseCategoryResolver {
  constructor(private service: ExerciseCategoryService) {}

  constructFilters = (query: any, filter: ExerciseCategoryFilter) => {
    if (filter) {
      if (filter.id) {
        query.findByIds([filter.id]);
      }

      if (filter.ids) {
        query.whereIn('id', filter.ids);
      }

      if (filter.name) {
        query.where('name', 'ilike', `%${filter.name}%`);
      }
    }

    return query;
  };

  @Query('_allExerciseCategoriesMeta')
  async _allExerciseCategoriesMeta(
    @Args('filter') filter: ExerciseCategoryFilter,
  ): Promise<ListMetadata> {
    const [count] = await this.constructFilters(this.service.count(), filter);
    return count;
  }

  @Query('allExerciseCategories')
  async allExerciseCategories(
    @Args('page') page: number,
    @Args('perPage') perPage: number,
    @Args('sortField') sortField: string,
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' | null,
    @Args('filter') filter: ExerciseCategoryFilter,
  ): Promise<ExerciseCategory[]> {
    return this.constructFilters(
      constructLimits(this.service.findAll(), {
        page,
        perPage,
        sortField,
        sortOrder,
      }),
      filter,
    );
  }

  @Query('ExerciseCategory')
  async ExerciseCategory(@Args('id') id: string): Promise<ExerciseCategory> {
    return this.service.findById(id);
  }

  @Mutation('createExerciseCategory')
  async createExerciseCategory(
    @Args('name') name: string,
  ): Promise<ExerciseCategory> {
    return this.service.create(name);
  }

  @Mutation('updateExerciseCategory')
  async updateExerciseCategory(
    @Args('id') id: string,
    @Args('name') name: string,
  ): Promise<ExerciseCategory> {
    return this.service.update(id, name);
  }

  @Mutation('deleteExerciseCategory')
  async deleteExerciseCategory(
    @Args('id') id: string,
  ): Promise<ExerciseCategory> {
    const ExerciseCategoryToDelete = await this.service.findById(id);
    await this.service.delete(id);

    return ExerciseCategoryToDelete;
  }
}
