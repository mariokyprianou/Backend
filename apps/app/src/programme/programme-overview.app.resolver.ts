import { AuthContext, Programme, ShareMediaImageType } from '@lib/power';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { WorkoutService } from '@lib/power/workout';
import { CommonService } from '@lib/common';
import { ProgrammeResolver } from './programme.app.resolver';
import { TrainerLoaders } from '@lib/power/trainer/trainer.loaders';
import { ProgrammeLoaders } from '@lib/power/programme/programme.loaders';

@Resolver('ProgrammeOverview')
export class ProgrammeOverviewResolver extends ProgrammeResolver {
  constructor(
    workoutService: WorkoutService,
    commonService: CommonService,
    trainerLoaders: TrainerLoaders,
    programmeLoaders: ProgrammeLoaders,
  ) {
    super(workoutService, commonService, trainerLoaders, programmeLoaders);
  }

  @ResolveField('numberOfWeeks')
  public getNumberOfWeeks(@Parent() programme: Programme) {
    return this.workoutService
      .findByProgramme({ programmeId: programme.id })
      .resultSize();
  }

  @ResolveField('firstWeek')
  public async getFirstWeek(
    @Parent() programme: Programme,
    @Context('language') language: string,
  ) {
    const firstWeek = await this.workoutService.findByProgramme({
      programmeId: programme.id,
      weeks: [1],
    });

    return firstWeek;
  }

  @ResolveField('progressStartShareMediaImage')
  public async getProgressStartShareMediaImage(
    @Parent() programme: Programme,
    @Context('language') language: string,
  ) {
    const shareMediaImages = await this.programmeLoaders.findShareMediaByProgrammeId.load(
      programme.id,
    );

    const images = shareMediaImages.find(
      (media) => media.type === ShareMediaImageType.PROGRAMME_START,
    );
    const image = images && images.getTranslation(language);

    if (image && image.imageKey) {
      return {
        url: this.commonService.getPresignedUrl(
          image.imageKey,
          this.commonService.env().FILES_BUCKET,
          'getObject',
        ),
        colour: image.colour,
      };
    }
  }

  @ResolveField('userProgress')
  public async getUserProgress(
    @Parent() programme: Programme,
    @Context('authContext') authContext?: AuthContext,
  ) {
    if (!authContext.id) {
      return {
        isActive: false,
        latestWeek: 0,
      };
    }

    return this.programmeLoaders.findUserProgressByProgrammeId.load(
      programme.id,
    );
  }
}
