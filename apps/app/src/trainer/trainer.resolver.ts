/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonService } from '@lib/common/common.service';
import { AuthContext } from '@lib/power';
import { ProgrammeService } from '@lib/power/programme';
import { Trainer } from '@lib/power/trainer';
import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TrainerService } from '../../../../libs/power/src/trainer/trainer.service';
import { WorkoutService } from '@lib/power/workout';
import { UserPowerService } from '@lib/power/user-power';

@Resolver('Trainer')
export class TrainerResolver {
  constructor(
    private service: TrainerService,
    private common: CommonService,
    private programme: ProgrammeService,
    private workout: WorkoutService,
    private userPower: UserPowerService,
  ) {}

  @Query('getTrainers')
  async getTrainer(@Context('language') language: string) {
    return this.service.findAll(language);
  }

  @ResolveField('name')
  name(@Parent() trainer: Trainer, @Context('language') language: string) {
    return trainer.getTranslation(language).name;
  }

  @ResolveField('programmes')
  async programmes(
    @Parent() trainer: Trainer,
    @Context('language') language: string,
    @Context('authContext') authContext?: AuthContext,
  ) {
    // Resolve the graph relation to fetch the trainers programmes.
    const relatedProgrammes = await this.programme
      .findAll(language)
      .where('trainer_id', trainer.id)
      .andWhere('status', 'PUBLISHED');

    const allUserInformation =
      authContext && authContext.sub && relatedProgrammes.length
        ? await this.userPower.getProgrammeInformation(
            relatedProgrammes,
            authContext,
          )
        : [];

    const res = await Promise.all(
      relatedProgrammes.map(async (programme) => {
        const images = programme.shareMediaImages.find(
          (media) => media.type.toString() === 'PROGRAMME_START',
        );
        const image = images && images.getTranslation(language);

        const firstWeek = await this.workout
          .findAll(programme.id)
          .where('week_number', 1);
        // const week = firstWeek[0];

        const primaryProgrammeImage = programme.images.find(
          (image) => image.orderIndex === 0,
        );

        const count = await this.workout.findAll(programme.id);

        const userProgress = allUserInformation.find(
          (val) => val && val.id === programme.id,
        );

        return {
          id: programme.id,
          trainer: trainer,
          environment: programme.environment,
          fatLoss: programme.fatLoss,
          fitness: programme.fitness,
          muscle: programme.muscle,
          description: programme.getTranslation(language).description,
          progressStartShareMediaImage: image && {
            url:
              image.imageKey &&
              (await this.common.getPresignedUrl(
                image.imageKey,
                this.common.env().FILES_BUCKET,
                'getObject',
              )),
            colour: image.colour,
          },
          firstWeek: await Promise.all(
            firstWeek.map(async (week) => ({
              ...week,
              workout: {
                overviewImage:
                  week.workout.overviewImageKey &&
                  (await this.common.getPresignedUrl(
                    week.workout.overviewImageKey,
                    this.common.env().FILES_BUCKET,
                    'getObject',
                  )),
                intensity: week.workout.intensity,
                duration: week.workout.duration,
                name: week.workout.getTranslation(language).name,
                exercises: null,
              },
            })),
          ),
          programmeImage:
            primaryProgrammeImage &&
            (await this.common.getPresignedUrl(
              primaryProgrammeImage.imageKey,
              this.common.env().FILES_BUCKET,
              'getObject',
            )),
          numberOfWeeks: count.length,
          userProgress,
        };
      }),
    );
    return res;
  }
}
