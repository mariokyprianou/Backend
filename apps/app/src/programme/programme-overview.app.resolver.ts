import { AuthContext, Programme, ProgrammeService } from '@lib/power';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { WorkoutService } from '@lib/power/workout';
import { CommonService } from '@lib/common';
import { TrainerService } from '@lib/power/trainer';
import { ProgrammeResolver } from './programme.app.resolver';
import { UserPowerService } from '@lib/power/user-power';

@Resolver('ProgrammeOverview')
export class ProgrammeOverviewResolver extends ProgrammeResolver {
  constructor(
    workoutService: WorkoutService,
    commonService: CommonService,
    trainerService: TrainerService,
    private programmeService: ProgrammeService,
    private userPower: UserPowerService,
  ) {
    super(workoutService, commonService, trainerService);
  }

  @ResolveField('numberOfWeeks')
  public getNumberOfWeeks(@Parent() programme: Programme) {
    return this.workoutService.findAll(programme.id).resultSize();
  }

  @ResolveField('firstWeek')
  public async getFirstWeek(
    @Parent() programme: Programme,
    @Context('language') language: string,
  ) {
    const firstWeek = await this.workoutService
      .findAll(programme.id)
      .where('week_number', 1);

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
  public getProgressStartShareMediaImage(
    @Parent() programme: Programme,
    @Context('language') language: string,
  ) {
    const images = programme.shareMediaImages.find(
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
  public getProgrammeImage(@Parent() programme: Programme) {
    const primaryProgrammeImage = programme.images.find(
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
    @Context('language') language: string,
    @Context('authContext') authContext?: AuthContext,
  ) {
    const relatedProgrammes = await this.programmeService
      .findAll(language)
      .where('trainer_id', programme.trainerId)
      .andWhere('status', 'PUBLISHED');

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
