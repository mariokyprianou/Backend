import { Exercise } from '@lib/power/exercise';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExerciseService } from '@lib/power/exercise/exercise.service';
import {
  Filter,
  ListMetadata,
  ExerciseLocalisation,
  IExercise,
} from '@lib/power/types';
import { constructLimits } from '../constructLimits';
import { CommonService } from '@lib/common';
import { v4 as uuid } from 'uuid';

interface ExerciseFilter extends Filter {
  name: string;
  trainer: string;
}

@Resolver('Exercise')
export class ExerciseResolver {
  constructor(
    private service: ExerciseService,
    private common: CommonService,
  ) {}

  constructFilters = (query: any, filter: ExerciseFilter) => {
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

      if (filter.trainer) {
        query.where('trainer_id', filter.trainer);
      }
    }

    return query;
  };

  @ResolveField('video')
  async getVideo(@Parent() exercise: Exercise) {
    return this.common.getPresignedUrl(
      exercise.videoKey,
      this.common.env().VIDEO_BUCKET_DESTINATION,
      'getObject',
      'us-east-1',
    );
  }
  @ResolveField('videoEasy')
  async getVideoEasy(@Parent() exercise: Exercise) {
    if (!exercise.videoKeyEasy) {
      return null;
    }
    return this.common.getPresignedUrl(
      exercise.videoKeyEasy,
      this.common.env().VIDEO_BUCKET_DESTINATION,
      'getObject',
      'us-east-1',
    );
  }
  @ResolveField('videoEasiest')
  async getVideoEasiest(@Parent() exercise: Exercise) {
    if (!exercise.videoKeyEasiest) {
      return null;
    }
    return this.common.getPresignedUrl(
      exercise.videoKeyEasiest,
      this.common.env().VIDEO_BUCKET_DESTINATION,
      'getObject',
      'us-east-1',
    );
  }

  @Query('_allExercisesMeta')
  async _allExercisesMeta(
    @Args('filter') filter: ExerciseFilter,
  ): Promise<ListMetadata> {
    const [count] = await this.constructFilters(this.service.count(), filter);
    return count;
  }

  @Query('allExercises')
  async allExercises(
    @Context('language') language: string,
    @Args('page') page: number,
    @Args('perPage') perPage: number,
    @Args('sortField') sortField: string,
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' | null,
    @Args('filter') filter: ExerciseFilter,
  ): Promise<Exercise[]> {
    return this.constructFilters(
      constructLimits(this.service.findAll(language), {
        page,
        perPage,
        sortField,
        sortOrder,
      }),
      filter,
    );
  }

  @Query('Exercise')
  async Exercise(@Args('id') id: string): Promise<Exercise> {
    return this.service.findById(id);
  }

  @Mutation('createExercise')
  async createExercise(
    @Args('exercise') exercise: IExercise,
    @Args('localisations') localisations: ExerciseLocalisation[] = [],
  ): Promise<Exercise> {
    if (!exercise.trainerId) {
      throw new Error('exercise.trainerId is required on createExercise');
    }
    return this.service.create(exercise, localisations);
  }

  @Mutation('updateExercise')
  async updateExercise(
    @Args('id') id: string,
    @Args('exercise') exercise: IExercise,
    @Args('localisations') localisations: ExerciseLocalisation[],
  ): Promise<Exercise> {
    return this.service.update(id, exercise, localisations);
  }

  @Mutation('deleteExercise')
  async deleteExercise(@Args('id') id: string): Promise<Exercise> {
    const ExerciseToDelete = await this.service.findById(id);
    await this.service.delete(id);

    // TODO: Tidy up S3 bucket(s)

    return ExerciseToDelete;
  }

  @Mutation('requestVideoUpload')
  async requestVideoUpload(): Promise<{
    key: string;
    url: string;
  }> {
    const key = `${uuid()}`;
    const url = await this.common.getPresignedUrl(
      `assets01/${key}`,
      this.common.env().VIDEO_BUCKET_SOURCE,
      'putObject',
      'us-east-1',
    );

    return {
      key,
      url,
    };
  }
}
