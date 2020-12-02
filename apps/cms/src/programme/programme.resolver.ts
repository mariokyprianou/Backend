import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { constructLimits } from '../constructLimits';
import { Filter, IShareMedia, ListMetadata } from '@lib/power/types';
import { Programme } from '@lib/power/programme';
import { ProgrammeService } from '@lib/power/programme/programme.service';
import { IProgramme } from '../../../../libs/power/src/types';
import { CommonService } from '@lib/common';
import { TrainerService } from '@lib/power/trainer';
import { ProgrammeImage } from '@lib/power/programme/programme-image.model';

interface ProgrammeFilter extends Filter {
  trainerId: string;
  environment: string;
}

@Resolver('Programme')
export class ProgrammeResolver {
  constructor(
    private service: ProgrammeService,
    private common: CommonService,
    private trainer: TrainerService,
  ) {}

  constructFilters = (query: any, filter: ProgrammeFilter) => {
    if (filter) {
      if (filter.id) {
        query.findByIds([filter.id]);
      }

      if (filter.ids) {
        query.whereIn('id', filter.ids);
      }

      if (filter.trainerId) {
        query.where('trainer_id', filter.trainerId);
      }
      if (filter.environment) {
        query.where('environment', filter.environment);
      }
    }

    return query;
  };

  @ResolveField('subscribers')
  async getSubscriber(@Parent() programme: Programme) {
    // TODO return subscribers
    return 0;
  }

  @ResolveField('trainer')
  async getTrainer(@Parent() programme: Programme) {
    return this.trainer.findById(programme.trainerId);
  }

  @ResolveField('shareMediaImages')
  async getShareMediaImages(@Parent() programme: Programme) {
    console.log(programme.shareMediaImages);
    return Promise.all(
      programme.shareMediaImages.map(async (each) => ({
        id: each.id,
        type: each.type,
        localisations: await Promise.all(
          each.localisations.map(async (locale) => ({
            language: locale.language,
            url: await this.common.getPresignedUrl(
              locale.imageKey,
              this.common.env().FILES_BUCKET,
              'getObject',
              5,
            ),
            colour: locale.colour,
          })),
        ),
      })),
    );
  }

  @ResolveField('images')
  async getImages(@Parent() programme: Programme) {
    return Promise.all(
      programme.images.map(async (each: ProgrammeImage) => ({
        orderIndex: each.orderIndex,
        url: await this.common.getPresignedUrl(
          each.imageKey,
          this.common.env().FILES_BUCKET,
          'getObject',
        ),
      })),
    );
  }

  @Query('_allProgrammesMeta')
  async _allProgrammesMeta(
    @Args('filter') filter: ProgrammeFilter,
  ): Promise<ListMetadata> {
    const [count] = await this.constructFilters(this.service.count(), filter);
    return count;
  }

  @Mutation('createProgramme')
  async createProgramme(
    @Args('programme') programme: IProgramme,
  ): Promise<Programme> {
    return this.service.create(programme);
  }

  @Query('allProgrammes')
  async allProgrammes(
    @Args('page') page: number,
    @Args('perPage') perPage: number,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' | null,
    @Args('filter') filter: ProgrammeFilter,
  ): Promise<Programme[]> {
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

  @Query('Programme')
  async Programme(@Args('id') id: string): Promise<Programme> {
    return this.service.findById(id);
  }

  @Mutation('updateProgramme')
  async updateProgramme(
    @Args('id') id: string,
    @Args('programme') programme: IProgramme,
  ): Promise<Programme> {
    return this.service.update(id, programme);
  }

  @Mutation('deleteProgramme')
  async deleteProgramme(@Args('id') id: string): Promise<Programme> {
    const ProgrammeToDelete = await this.service.findById(id);
    await this.service.delete(id);

    return ProgrammeToDelete;
  }

  @Mutation('createShareImage')
  async createShareImage(
    @Args('programme') programme: string,
    @Args('media') media: IShareMedia,
  ): Promise<Programme> {
    return this.service.createShareMedia(programme, media);
  }

  @Mutation('updateShareImage')
  async updateShareImage(
    @Args('programme') programme: string,
    @Args('id') id: string,
    @Args('media') media: IShareMedia,
  ): Promise<Programme> {
    return this.service.updateShareMedia(programme, id, media);
  }
}
