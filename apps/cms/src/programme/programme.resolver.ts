import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { applyPagination } from '@lib/database';
import { Filter, ListMetadata } from '@lib/power/types';
import { Programme } from '@lib/power/programme';
import { ProgrammeService } from '@lib/power/programme/programme.service';
import { IProgramme } from '../../../../libs/power/src/types';
import { CommonService } from '@lib/common';
import { TrainerService } from '@lib/power/trainer';
import { ProgrammeImage } from '@lib/power/programme/programme-image.model';
import { AccountService } from '@lib/power/account';

interface ProgrammeFilter extends Filter {
  trainerId: string;
  environment: string;
  id: string;
  ids: string[];
}

@Resolver('Programme')
export class ProgrammeResolver {
  constructor(
    private programmeService: ProgrammeService,
    private commonService: CommonService,
    private trainerService: TrainerService,
    private accountService: AccountService,
  ) {}

  constructFilters = (query: any, filter: ProgrammeFilter) => {
    if (filter) {
      if (filter.id) {
        query.where('training_programme.id', filter.id);
      }

      if (filter.ids) {
        query.whereIn('training_programme.id', filter.ids);
      }

      if (filter.trainerId) {
        query.where('training_programme.trainer_id', filter.trainerId);
      }
      if (filter.environment) {
        query.where('training_programme.environment', filter.environment);
      }
    }

    return query;
  };

  @ResolveField('subscribers')
  async getSubscriber(@Parent() programme: Programme) {
    // Find all account (and user training programmes)
    // Filter by programme id
    const accounts = await this.accountService
      .findAll()
      .withGraphFetched('trainingProgramme');

    const activeProgs = accounts.filter(
      (each) => each.trainingProgramme.trainingProgrammeId === programme.id,
    );
    return activeProgs.length;
  }

  @ResolveField('trainer')
  async getTrainer(@Parent() programme: Programme) {
    return this.trainerService.findById(programme.trainerId);
  }

  @ResolveField('shareMediaImages')
  async getShareMediaImages(@Parent() programme: Programme) {
    if (!programme.shareMediaImages) {
      return [];
    }
    return Promise.all(
      programme.shareMediaImages.map(async (image) => {
        return {
          id: image.id,
          type: image.type,
          localisations: image.localisations.map((locale) => ({
            language: locale.language,
            url: this.commonService.getPresignedUrl(
              locale.imageKey,
              this.commonService.env().FILES_BUCKET,
              'getObject',
            ),
            imageKey: locale.imageKey,
            colour: locale.colour,
          })),
        };
      }),
    );
  }

  @ResolveField('images')
  async getImages(@Parent() programme: Programme) {
    return Promise.all(
      programme.images.map(async (each: ProgrammeImage) => ({
        orderIndex: each.orderIndex,
        url: await this.commonService.getPresignedUrl(
          each.imageKey,
          this.commonService.env().FILES_BUCKET,
          'getObject',
        ),
        imageKey: each.imageKey,
      })),
    );
  }

  @Query('_allProgrammesMeta')
  async _allProgrammesMeta(
    @Args('page') page: number,
    @Args('perPage') perPage: number,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' | null,
    @Args('filter') filter: ProgrammeFilter,
  ): Promise<ListMetadata> {
    const [count] = await this.constructFilters(
      this.programmeService.count(),
      filter,
    );
    return count;
  }

  @Mutation('createProgramme')
  async createProgramme(
    @Args('programme') programme: IProgramme,
  ): Promise<Programme> {
    return this.programmeService.create(programme);
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
      applyPagination(this.programmeService.findAll(), {
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
    return this.programmeService.findById(id);
  }

  @Mutation('updateProgramme')
  async updateProgramme(
    @Args('id') id: string,
    @Args('programme') programme: IProgramme,
  ): Promise<Programme> {
    return this.programmeService.updateProgramme({ id, ...programme });
  }

  @Mutation('deleteProgramme')
  async deleteProgramme(@Args('id') id: string): Promise<Programme> {
    const ProgrammeToDelete = await this.programmeService.findById(id);
    await this.programmeService.delete(id);

    return ProgrammeToDelete;
  }

  @Mutation('uploadMedia')
  async uploadMedia(@Args('input') input: UploadMediaInput) {
    return {
      contentType: input.contentType,
      key: input.key,
      uploadUrl: await this.commonService.getPresignedUrl(
        input.key,
        this.commonService.env().FILES_BUCKET,
        'putObject',
        'ap-south-1',
        5,
        input.contentType,
      ),
    };
  }
}

export interface UploadMediaInput {
  contentType: string;
  key: string;
}
