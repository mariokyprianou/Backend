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
import { ExerciseCmsService } from '@lib/power/exercise/exercise.cms.service';
import {
  ListMetadata,
  ExerciseLocalisation,
  IExercise,
} from '@lib/power/types';
import { CmsParams, CommonService } from '@lib/common';
import { v4 as uuid } from 'uuid';
import { S3 } from 'aws-sdk';
import { ExerciseFilter } from '@lib/power/exercise/exercise.interface';

function returnKey(key) {
  return `${key}_1080.mp4`;
}

@Resolver('Exercise')
export class ExerciseResolver {
  constructor(
    private readonly exerciseService: ExerciseCmsService,
    private readonly commonService: CommonService,
  ) {}

  constructFilters = (query: any, filter: ExerciseFilter) => {
    if (filter) {
      if (filter.id) {
        query.findByIds([filter.id]);
      }

      if (filter.ids) {
        query.findByIds(filter.ids);
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
    return this.commonService.getPresignedUrl(
      returnKey(exercise.videoKey),
      this.commonService.env().VIDEO_BUCKET_DESTINATION,
      'getObject',
      this.commonService.env().VIDEO_BUCKET_REGION,
    );
  }

  @ResolveField('videoKey')
  video(@Parent() exercise: Exercise) {
    if (!exercise.videoKey) {
      return null;
    }
    return exercise.videoKey;
  }

  @ResolveField('videoEasy')
  async getVideoEasy(@Parent() exercise: Exercise) {
    if (!exercise.videoKeyEasy) {
      return null;
    }
    return this.commonService.getPresignedUrl(
      returnKey(exercise.videoKeyEasy),
      this.commonService.env().VIDEO_BUCKET_DESTINATION,
      'getObject',
      this.commonService.env().VIDEO_BUCKET_REGION,
    );
  }

  @ResolveField('videoEasyKey')
  videoEasy(@Parent() exercise: Exercise) {
    if (!exercise.videoKeyEasy) {
      return null;
    }
    return exercise.videoKeyEasy;
  }

  @ResolveField('videoEasiest')
  async getVideoEasiest(@Parent() exercise: Exercise) {
    if (!exercise.videoKeyEasiest) {
      return null;
    }
    return this.commonService.getPresignedUrl(
      returnKey(exercise.videoKeyEasiest),
      this.commonService.env().VIDEO_BUCKET_DESTINATION,
      'getObject',
      this.commonService.env().VIDEO_BUCKET_REGION,
    );
  }

  @ResolveField('videoEasiestKey')
  videoEasiest(@Parent() exercise: Exercise) {
    if (!exercise.videoKeyEasiest) {
      return null;
    }
    return exercise.videoKeyEasiest;
  }

  @ResolveField('trainer')
  async getTrainer(@Parent() exercise: Exercise) {
    return exercise.trainerId;
  }

  @Query('_allExercisesMeta')
  async _allExercisesMeta(
    @Args() params: CmsParams<ExerciseFilter>,
  ): Promise<ListMetadata> {
    const { count } = await this.exerciseService.findCount(params);
    return { count };
  }

  @Query('allExercises')
  async allExercises(
    @Context('language') language: string,
    @Args() params: CmsParams<ExerciseFilter>,
  ): Promise<Exercise[]> {
    return this.exerciseService.findAll({
      language,
      page: params.page,
      perPage: params.perPage,
      filter: params.filter,
      sortField: params.sortField,
      sortOrder: params.sortOrder,
    });
  }

  @Query('Exercise')
  async Exercise(@Args('id') id: string): Promise<Exercise> {
    return this.exerciseService.findById(id);
  }

  @Mutation('createExercise')
  async createExercise(
    @Args('exercise') exercise: IExercise,
    @Args('localisations') localisations: ExerciseLocalisation[] = [],
  ): Promise<Exercise> {
    if (!exercise.trainerId) {
      throw new Error('exercise.trainerId is required on createExercise');
    }
    return this.exerciseService.create(exercise, localisations);
  }

  @Mutation('updateExercise')
  async updateExercise(
    @Args('id') id: string,
    @Args('exercise') exercise: IExercise,
    @Args('localisations') localisations: ExerciseLocalisation[],
  ): Promise<Exercise> {
    return this.exerciseService.update(id, exercise, localisations);
  }

  @Mutation('deleteExercise')
  async deleteExercise(@Args('id') id: string): Promise<Exercise> {
    // const ExerciseToDelete = await this.service.findById(id);
    // await this.service.delete(id);

    // TODO: Tidy up S3 bucket(s)

    return this.exerciseService.delete(id);
  }

  @Mutation('requestVideoUpload')
  async requestVideoUpload(): Promise<{
    key: string;
    url: string;
  }> {
    const key = `${uuid()}`;

    const s3 = new S3({ region: this.commonService.env().VIDEO_BUCKET_REGION });
    const url = await s3.getSignedUrlPromise('putObject', {
      Key: `assets01/${key}.mp4`,
      Bucket: this.commonService.env().VIDEO_BUCKET_SOURCE,
      Expires: 60 * 5,
      ContentType: 'video/mp4',
    });

    return {
      key,
      url,
    };
  }
}
