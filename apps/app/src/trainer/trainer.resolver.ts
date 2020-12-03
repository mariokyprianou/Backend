/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonService } from '@lib/common/common.service';
import { ShareMediaType } from '@lib/power/types';
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

@Resolver('Trainer')
export class TrainerResolver {
  constructor(
    private service: TrainerService,
    private common: CommonService,
    private programme: ProgrammeService,
    private workout: WorkoutService,
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
  ) {
    // Resolve the graph relation to fetch the trainers programmes.
    const relatedProgrammes = await this.programme
      .findAll(language)
      .where('trainer_id', trainer.id);

    const res = await Promise.all(
      relatedProgrammes.map(async (programme) => {
        const images = programme.shareMediaImages.find(
          (media) => media.type === ShareMediaType.PROGRAMME_START,
        );
        const imageKey = images && images.getTranslation(language).imageKey;

        const firstWeek = await this.workout.findAll().where('week_number', 1);

        return {
          id: programme.id,
          trainer: trainer,
          environment: programme.environment,
          fatLoss: programme.fatLoss,
          fitness: programme.fitness,
          muscle: programme.muscle,
          description: programme.getTranslation(language).description,
          progressStartShareMediaImage:
            imageKey &&
            (await this.common.getPresignedUrl(
              imageKey,
              this.common.env().FILES_BUCKET,
              'getObject',
            )),
          firstWeek: await Promise.all(
            firstWeek.map(async (week) => ({
              ...week,
              workout: {
                overviewImage: await this.common.getPresignedUrl(
                  week.workout.overviewImageKey,
                  this.common.env().FILES_BUCKET,
                  'getObject',
                ),
                intensity: week.workout.intensity,
                duration: week.workout.duration,
                name: week.workout.getTranslation(language).name,
                exercises: null,
              },
            })),
          ),
        };
      }),
    );
    return res;
  }
}
