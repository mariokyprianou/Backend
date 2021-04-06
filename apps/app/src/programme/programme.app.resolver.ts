import { Programme } from '@lib/power';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { WorkoutService } from '@lib/power/workout';
import { CommonService } from '@lib/common';
import { TrainerLoaders } from '@lib/power/trainer/trainer.loaders';

@Resolver('Programme')
export class ProgrammeResolver {
  constructor(
    protected workoutService: WorkoutService,
    protected commonService: CommonService,
    protected trainerLoaders: TrainerLoaders,
  ) {}

  @ResolveField('id')
  public getId(@Parent() programme: Programme) {
    return programme.id;
  }

  @ResolveField('trainer')
  public getTrainer(@Parent() programme: Programme) {
    return this.trainerLoaders.findById.load(programme.trainerId);
  }

  @ResolveField('environment')
  public getEnvironment(@Parent() programme: Programme) {
    return programme.environment;
  }

  @ResolveField('fatLoss')
  public getFatLoss(@Parent() programme: Programme) {
    return programme.fatLoss;
  }

  @ResolveField('fitness')
  public getFitness(@Parent() programme: Programme) {
    return programme.fitness;
  }

  @ResolveField('muscle')
  public getMuscle(@Parent() programme: Programme) {
    return programme.muscle;
  }

  @ResolveField('description')
  public getDescription(
    @Parent() programme: Programme,
    @Context('language') language: string,
  ) {
    return programme.getTranslation(language)?.description;
  }
}
