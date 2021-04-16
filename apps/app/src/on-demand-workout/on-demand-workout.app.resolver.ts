import { ParseUUIDPipe } from '@nestjs/common';
import {
  Args,
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CommonService, Connection } from '@lib/common';
import {
  OnDemandWorkoutService,
  OnDemandWorkout,
  ProgrammeLoaders,
} from '@lib/power';
import { AbstractWorkoutResolver } from '../workout/workout.resolver';

@Resolver('OnDemandWorkout')
export class OnDemandWorkoutAppResolver extends AbstractWorkoutResolver<OnDemandWorkout> {
  constructor(
    commonService: CommonService,
    programmeLoaders: ProgrammeLoaders,
    private readonly onDemandWorkoutService: OnDemandWorkoutService,
  ) {
    super(commonService, programmeLoaders);
  }

  @Query('onDemandWorkout')
  async getOnDemandWorkout(
    @Args('id', ParseUUIDPipe) id: string,
    @Context('language') language: string,
  ): Promise<OnDemandWorkout> {
    return this.onDemandWorkoutService.findById(id, { language });
  }

  @Query('onDemandWorkouts')
  async getOnDemandWorkouts(
    @Context('language') language: string,
  ): Promise<Connection<OnDemandWorkout>> {
    const onDemandWorkouts = await this.onDemandWorkoutService.findAll({
      language,
    });
    return {
      nodes: onDemandWorkouts,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  getWorkoutModel(parent: OnDemandWorkout) {
    return parent.workout;
  }

  @ResolveField('id')
  public async getId(@Parent() workout: OnDemandWorkout) {
    return workout.id;
  }
}
