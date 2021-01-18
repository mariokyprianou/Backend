import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { UserWorkout, UserWorkoutFilter } from '@lib/power/user-workout';
import { ListMetadata } from '@lib/power/types';
import { FeedbackService } from './feedback.service';

@Resolver('Feedback')
export class FeedbackResolver {
  constructor(
    private readonly feedbackService: FeedbackService /*, private readonly userService: UserService */,
  ) {}

  @Query('Feedback')
  async Feedback(@Args('id') id) {
    return await this.feedbackService.findById(id);
  }

  @Query('allFeedbacks')
  async allFeedbacks(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: UserWorkoutFilter = {},
  ) {
    return this.feedbackService.findAll(
      page,
      perPage,
      sortField,
      sortOrder,
      filter,
    );
  }

  @Query('_allFeedbacksMeta')
  async _allFeedbacksMeta(
    @Args('filter') filter: UserWorkoutFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.feedbackService.findAllMeta(filter),
    };
  }

  @ResolveField('trainerName')
  getTrainerName(@Parent() userWorkout: UserWorkout) {
    return userWorkout.workout.trainingProgramme.trainer.localisations.find(
      (x) => x.language == 'en',
    ).name;
  }

  @ResolveField('week')
  getWeek(@Parent() userWorkout: UserWorkout) {
    return userWorkout.userWorkoutWeek.weekNumber;
  }

  @ResolveField('workoutName')
  getWorkoutName(@Parent() userWorkout: UserWorkout) {
    return userWorkout.workout.localisations.find((x) => x.language == 'en')
      .name;
  }

  @ResolveField('emojis')
  getEmojis(@Parent() userWorkout: UserWorkout) {
    return userWorkout.emojis.map((x) => x.emoji);
  }

  // TODO: when the user tables are setup
  @ResolveField('userEmail')
  getUserEmail(@Parent() userWorkout: UserWorkout) {
    // TODO: needs the user work to be merged
    // const userID = userWorkout.userWorkoutWeek.userTrainingProgramme.accountId;
    // const user = this.userService.findById(userID);
    // return user.email;

    return 'fake@fake.com';
  }

  @ResolveField('timeTaken')
  getTimeTaken(@Parent() userWorkout: UserWorkout) {
    return userWorkout.timeTaken;
  }

  @ResolveField('workoutIntensity')
  getWorkoutIntensity(@Parent() userWorkout: UserWorkout) {
    return userWorkout.feedbackIntensity;
  }

  @ResolveField('date')
  getDate(@Parent() userWorkout: UserWorkout) {
    return userWorkout.completedAt;
  }
}
