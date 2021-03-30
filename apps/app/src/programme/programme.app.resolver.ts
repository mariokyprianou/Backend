import { Programme } from '@lib/power';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { WorkoutService } from '@lib/power/workout';
import { CommonService } from '@lib/common';
import { TrainerService } from '@lib/power/trainer';

@Resolver('Programme')
export class ProgrammeResolver {
  constructor(
    protected workoutService: WorkoutService,
    protected commonService: CommonService,
    protected trainerService: TrainerService,
  ) {}

  @ResolveField('id')
  public getId(@Parent() programme: Programme) {
    return programme.id;
  }

  @ResolveField('trainer')
  public getTrainer(
    @Parent() programme: Programme,
    @Context('language') language: string,
  ) {
    return this.trainerService.findById(programme.trainerId, language);
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
