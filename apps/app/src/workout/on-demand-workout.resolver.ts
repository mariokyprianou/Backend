import { OnDemandWorkoutService, OnDemandWorkout } from '@lib/power';
import { Query } from '@nestjs/graphql';

export class OnDemandWorkoutResolver {
  constructor(
    private readonly onDemandWorkoutService: OnDemandWorkoutService,
  ) {}

  @Query('onDemandWorkouts')
  async getOnDemandWorkouts() {
    // pageInfo
  }
}
