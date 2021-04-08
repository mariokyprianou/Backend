import {
  AuthContext,
  Programme,
  ProgrammeService,
  PublishStatus,
} from '@lib/power';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { WorkoutService } from '@lib/power/workout';
import { CommonService } from '@lib/common';
import { ProgrammeResolver } from './programme.app.resolver';
import { UserPowerService } from '@lib/power/user-power';
import { TrainerLoaders } from '@lib/power/trainer/trainer.loaders';
import { ProgrammeLoaders } from '@lib/power/programme/programme.loaders';

@Resolver('ProgrammeOverview')
export class ProgrammeOverviewResolver extends ProgrammeResolver {
  constructor(
    workoutService: WorkoutService,
    commonService: CommonService,
    trainerLoaders: TrainerLoaders,
    private programmeService: ProgrammeService,
    private userPower: UserPowerService,
    private programmeLoaders: ProgrammeLoaders,
  ) {
    super(workoutService, commonService, trainerLoaders);
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

    return firstWeek.map((week) => ({
      ...week,
      workout: {
        overviewImage:
          week.workout.overviewImageKey &&
          this.commonService.getPresignedUrl(
            week.workout.overviewImageKey,
            this.commonService.env().FILES_BUCKET,
            'getObject',
          ),
        intensity: week.workout.intensity,
        duration: week.workout.duration,
        name: week.workout.getTranslation(language).name,
        exercises: null,
      },
    }));
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
      (media) => media.type.toString() === 'PROGRAMME_START',
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

  @ResolveField('programmeImage')
  public async getProgrammeImage(@Parent() programme: Programme) {
    const images = await this.programmeLoaders.findImagesByProgrammeId.load(
      programme.id,
    );
    const primaryProgrammeImage = images.find(
      (image) => image.orderIndex === 0,
    );

    if (primaryProgrammeImage) {
      return this.commonService.getPresignedUrl(
        primaryProgrammeImage.imageKey,
        this.commonService.env().FILES_BUCKET,
        'getObject',
      );
    }
  }

  @ResolveField('userProgress')
  public async getUserProgress(
    @Parent() programme: Programme,
    @Context('authContext') authContext?: AuthContext,
  ) {
    const relatedProgrammes = await this.programmeService.findAll({
      filter: {
        status: PublishStatus.PUBLISHED,
        trainerId: programme.trainerId,
      },
    });

    const allUserInformation =
      authContext && authContext.sub && relatedProgrammes.length
        ? await this.userPower.getProgrammeInformation(
            relatedProgrammes,
            authContext,
          )
        : [];

    return allUserInformation.find((val) => val && val.id === programme.id);
  }
}
