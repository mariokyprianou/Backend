import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserWorkout, UserWorkoutFilter } from '@lib/power/user-workout';
import { ListMetadata } from '@lib/power/types';
import { FeedbackService } from './feedback.service';

@Resolver('Feedback')
export class FeedbackResolver {
  constructor(private readonly service: FeedbackService) {}

  @Query('Feedback')
  async Feedback(@Args('id') id): Promise<FeedbackGraphQlType> {
    return feedbackModelToFeedbackGraphQLType(await this.service.findById(id));
  }

  @Query('allFeedbacks')
  async allFeedbacks(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: UserWorkoutFilter = {},
  ): Promise<FeedbackGraphQlType[]> {
    const findAllQuery = this.service.findAll(
      page,
      perPage,
      sortField,
      sortOrder,
      filter,
    );

    return await (await findAllQuery).map(feedbackModelToFeedbackGraphQLType);
  }

  @Query('_allFeedbacksMeta')
  async _allFeedbacksMeta(
    @Args('filter') filter: UserWorkoutFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.service.findAllMeta(filter),
    };
  }
}

// this transformation is used as there isn't a 'feedback' table in the database
// and so there isn't a simple relation to an existing model
const feedbackModelToFeedbackGraphQLType = (
  userWorkout: UserWorkout | null,
): FeedbackGraphQlType => {
  if (userWorkout) {
    return {
      id: userWorkout.id,
      trainerName:
        userWorkout.workout.trainingProgramme.trainer.localisations[0].name,
      week: userWorkout.userWorkoutWeek.weekNumber,
      workoutName: userWorkout.workout.localisations[0].name,
      emoji: userWorkout.emojis.map((x) => x.emoji),
      userEmail: 'fake@fake.com', // TODO: when the user tables are setup
      timeTaken: userWorkout.timeTaken,
      workoutIntensity: userWorkout.feedBackIntensity,
      date: userWorkout.completedAt,
    };
  } else {
    return null;
  }
};

interface FeedbackGraphQlType {
  id: string;
  trainerName: string;
  week: number;
  workoutName: string;
  emoji: string[];
  userEmail: string;
  timeTaken?: number;
  workoutIntensity?: number;
  date: Date;
}
