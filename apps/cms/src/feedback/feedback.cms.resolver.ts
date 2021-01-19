import {
  Args,
  Query,
  Resolver,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';
import { UserWorkout, UserWorkoutFilter } from '@lib/power/user-workout';
import { ListMetadata } from '@lib/power/types';
import { FeedbackService } from './feedback.service';
import { GenerateCsvReportService, CsvFormat } from '@td/generate-csv-report';
import { UserService } from '@lib/power/user';

@Resolver('Feedback')
export class FeedbackResolver {
  constructor(
    private readonly feedbackService: FeedbackService /*, private readonly userService: UserService */,
    private readonly generateCsvReportService: GenerateCsvReportService,
    private userService: UserService,
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

  @Mutation('exportFeedback')
  async exportFeedback() {
    const feedbacks = await this.feedbackService.findAll(0, -1);

    const feedbackData: CsvFormat = {
      fields: [
        'Trainer',
        'Programme',
        'Week',
        'Workout Name',
        'Emoji',
        'User',
        'Time Taken',
        'Intensity',
        'Date',
      ],
      data: feedbacks.map((feedback) => {
        const trainerName = feedback.workout.trainingProgramme.trainer.localisations.find(
          (x) => x.language == 'en',
        ).name;

        const programmeName = feedback.workout.trainingProgramme.environment.toString();
        const week = feedback.userWorkoutWeek.weekNumber.toString();
        const workoutName = feedback.workout.localisations.find(
          (x) => x.language == 'en',
        ).name;
        const emoji = feedback.emojis.map((x) => x.emoji).toString();
        const userEmail = 'fake@fake.com'; // TODO!
        const timeTaken = feedback.timeTaken
          ? feedback.timeTaken.toString()
          : '';
        const intensity = feedback.feedbackIntensity
          ? feedback.feedbackIntensity.toString()
          : '';
        const date = feedback.completedAt
          ? feedback.completedAt.toString()
          : '';

        return [
          trainerName,
          programmeName,
          week,
          workoutName,
          emoji,
          userEmail,
          timeTaken,
          intensity,
          date,
        ];
      }),
    };

    return this.generateCsvReportService.generateAndUploadCsv(feedbackData);
  }

  @ResolveField('trainerName')
  getTrainerName(@Parent() userWorkout: UserWorkout) {
    return userWorkout.workout.trainingProgramme.trainer.localisations.find(
      (x) => x.language == 'en',
    ).name;
  }

  @ResolveField('environment')
  getEnvironment(@Parent() userWorkout: UserWorkout) {
    return userWorkout.workout.trainingProgramme.environment;
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

  @ResolveField('userEmail')
  async getUserEmail(@Parent() userWorkout: UserWorkout) {
    const userID = userWorkout.userWorkoutWeek.userTrainingProgramme.accountId;
    const user = await this.userService.findById(userID);
    return user.email;
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
