import {
  AuthContext,
  Programme,
  ShareMediaImageType,
  ScheduledWorkoutService,
  TrainerLoaders,
  ProgrammeLoaders,
} from '@lib/power';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ImageHandlerObjectStore, IMAGE_CDN } from '@lib/common';
import { AbstractProgrammeResolver } from './programme.app.resolver';
import { Inject } from '@nestjs/common';

@Resolver('ProgrammeOverview')
export class ProgrammeOverviewResolver extends AbstractProgrammeResolver {
  constructor(
    workoutService: ScheduledWorkoutService,
    trainerLoaders: TrainerLoaders,
    programmeLoaders: ProgrammeLoaders,
    @Inject(IMAGE_CDN) private imageStore: ImageHandlerObjectStore,
  ) {
    super(workoutService, trainerLoaders, programmeLoaders, imageStore);
  }

  @ResolveField('numberOfWeeks')
  public getNumberOfWeeks(@Parent() programme: Programme) {
    return programme.weeksAvailable;
  }

  @ResolveField('firstWeek')
  public async getFirstWeek(@Parent() programme: Programme) {
    const programmeWorkouts = await this.workoutService.findByProgrammeId(
      {
        programmeId: programme.id,
        weeks: [1],
      },
      { includeWorkout: true },
    );

    return programmeWorkouts;
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
        url: this.imageStore.getSignedUrl(image.imageKey, {
          expiresIn: 60 * 7 * 24,
          resize: {
            width: 720,
          },
        }),
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
