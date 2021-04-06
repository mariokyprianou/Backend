import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import { Programme, ProgrammeFilter } from '@lib/power';
import { ProgrammeService } from '@lib/power/programme/programme.cms.service';
import { IProgramme } from '../../../../libs/power/src/types';
import { CmsParams, CommonService } from '@lib/common';
import { TrainerService } from '@lib/power/trainer';
import { ProgrammeImage } from '@lib/power/programme/programme-image.model';
import { AccountService } from '@lib/power/account';

@Resolver('Programme')
export class ProgrammeResolver {
  constructor(
    private programmeService: ProgrammeService,
    private commonService: CommonService,
    private trainerService: TrainerService,
    private accountService: AccountService,
  ) {}

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
    @Args() params: CmsParams<ProgrammeFilter>,
  ): Promise<ListMetadata> {
    const { count } = await this.programmeService.findCount(params);
    return { count };
  }

  @Mutation('createProgramme')
  async createProgramme(
    @Args('programme') programme: IProgramme,
  ): Promise<Programme> {
    return this.programmeService.create(programme);
  }

  @Query('allProgrammes')
  async allProgrammes(
    @Args() params: CmsParams<ProgrammeFilter>,
  ): Promise<Programme[]> {
    const programmes = await this.programmeService.findAll(params);
    return programmes;
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
