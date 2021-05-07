import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Connection } from '@lib/common';
import {
  AuthContext,
  OnDemandWorkout,
  OnDemandWorkoutService,
  Workout,
} from '@lib/power';
import { CompleteWorkoutDto } from '@lib/power/user-power/dto/complete-workout.dto';

@Resolver()
export class OnDemandWorkoutAppResolver {
  constructor(
    private readonly onDemandWorkoutService: OnDemandWorkoutService,
  ) {}

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
    @Args('tagIds') tagIds?: string[],
  ): Promise<Connection<OnDemandWorkout>> {
    const onDemandWorkouts = await this.onDemandWorkoutService.findAll({
      tagIds,
      language,
    });

    // Currently returns all OD workouts
    // Returning a connection type to avoid breaking changes in future
    return {
      nodes: onDemandWorkouts,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  @Mutation('completeOnDemandWorkout')
  async completeOnDemandWorkout(
    @Context('authContext') user: AuthContext,
    @Args('input') params: CompleteWorkoutDto,
  ) {
    await this.onDemandWorkoutService.completeOnDemandWorkout(user.id, params);
    return {
      success: true,
    };
  }
}
