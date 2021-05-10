import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Connection } from '@lib/common';
import { OnDemandWorkout, OnDemandWorkoutService } from '@lib/power';
import { CompleteWorkoutDto } from '@lib/power/user-power/dto/complete-workout.dto';
import { User } from '../context';

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

  @Mutation('startOnDemandWorkout')
  async startOnDemandWorkout(@User() user: User) {
    try {
      const {
        workoutsCompleted,
      } = await this.onDemandWorkoutService.startOnDemandWorkout(user.id);
      return { success: true, workoutsCompleted };
    } catch (error) {
      console.log(error);
      return { success: true };
    }
  }

  @Mutation('completeOnDemandWorkout')
  async completeOnDemandWorkout(
    @User() user: User,
    @Args('input') params: CompleteWorkoutDto,
  ) {
    await this.onDemandWorkoutService.completeOnDemandWorkout(user.id, params);
    return {
      success: true,
    };
  }
}
