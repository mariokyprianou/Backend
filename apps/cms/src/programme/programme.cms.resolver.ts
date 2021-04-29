import * as uuid from 'uuid';
import * as mime from 'mime';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ListMetadata } from '@lib/power/types';
import { Programme, ProgrammeFilter, ProgrammeLoaders } from '@lib/power';
import { ProgrammeService } from '@lib/power/programme/programme.cms.service';
import { CmsParams, CommonService } from '@lib/common';
import { TrainerCmsService } from '@lib/power/trainer';
import { ProgrammeImage } from '@lib/power/programme/programme-image.model';
import { CreateProgrammeDto } from './dto/create-programme.dto';
import { UpdateProgrammeDto } from './dto/update-programme.dto';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver('Programme')
export class ProgrammeResolver {
  constructor(
    private programmeService: ProgrammeService,
    private commonService: CommonService,
    private trainerService: TrainerCmsService,
    private programmeLoaders: ProgrammeLoaders,
  ) {}

  @ResolveField('subscribers')
  async getSubscribers(@Parent() programme: Programme) {
    return this.programmeLoaders.findSubscriberCount.load(programme.id);
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
    @Args('programme') programme: CreateProgrammeDto,
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
  async Programme(@Args('id', ParseUUIDPipe) id: string): Promise<Programme> {
    return this.programmeService.findById(id);
  }

  @Mutation('updateProgramme')
  async updateProgramme(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('programme') programme: UpdateProgrammeDto,
  ): Promise<Programme> {
    return this.programmeService.updateProgramme(id, programme);
  }

  @Mutation('deleteProgramme')
  async deleteProgramme(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Programme> {
    const programme = await this.programmeService.findById(id);
    await this.programmeService.deleteProgramme(id);
    return programme;
  }

  @Mutation('uploadMedia')
  async uploadMedia(@Args('input') input: UploadMediaInput) {
    let contentType = input.contentType;
    if (!input.contentType) {
      contentType = mime.getType(input.key);
    }

    const ext = mime.getExtension(contentType);
    if (!ext) {
      throw new Error('Unsupported Content-Type:' + contentType);
    }

    const prefix = input.purpose ? `${input.purpose.toLowerCase()}/` : '';
    const key = `${prefix}${uuid.v4()}.${ext}`;

    return {
      key,
      contentType: input.contentType,
      uploadUrl: await this.commonService.getPresignedUrl(
        input.key,
        this.commonService.env().FILES_BUCKET,
        'putObject',
        'ap-south-1',
        15,
        input.contentType,
      ),
    };
  }
}

export interface UploadMediaInput {
  purpose?: string;
  contentType: string;
  key: string;
}
