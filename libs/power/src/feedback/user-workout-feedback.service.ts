import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { UserProgramme } from '../user-programme';
// import { Feedback } from 'apps/cms/src/feedback/feedback.resolver';
import { UserWorkout } from '../user-workout';
import { UserWorkoutWeek } from '../user-workout-week';
import { UserWorkoutFeedback } from './user-workout-feedback.model';
@Injectable()
export class UserWorkoutFeedbackService {
  public async all(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserWorkoutFeedbackFilter = {},
    id?: string,
  ) {
    const allFeedbackQuery = id
      ? UserWorkoutFeedback.query().withGraphFetched('account').where('id', id)
      : applyFilter(
          UserWorkoutFeedback.query().withGraphFetched('account'),
          filter,
        );

    allFeedbackQuery.limit(perPage).offset(perPage * page);
    allFeedbackQuery.orderBy(sortField, sortOrder);

    const allFeedback = await allFeedbackQuery;
    const workouts = allFeedback.map((each) => each.userWorkoutId);
    // Separate db so can't do relationship
    const fetchedWorkouts = await UserWorkout.query()
      .whereIn('id', [...new Set(workouts)])
      .withGraphFetched('workout.localisations');
    console.log(fetchedWorkouts);

    return Promise.all(
      allFeedback.map(async (feedback: UserWorkoutFeedback) => {
        const workout = fetchedWorkouts.find(
          (workout) => workout.id === feedback.userWorkoutId,
        );

        const workoutWeek = await UserWorkoutWeek.query()
          .where('id', workout.userWorkoutWeekId)
          .first();
        // .withGraphFetched(
        //   'userTrainingProgramme.trainingProgramme.trainer.localisations',
        // );
        const trainingProgramme = await UserProgramme.query()
          .first()
          .where('id', workoutWeek.userTrainingProgrammeId)
          .withGraphFetched('trainingProgramme.trainer.localisations');

        // Fetch trainer
        const trainerLoc = trainingProgramme.trainingProgramme.trainer.localisations.find(
          (loc) => loc.language === 'en',
        );

        const workoutLoc = workout.workout.localisations.find(
          (loc) => loc.language === 'en',
        );
        return {
          ...feedback,
          week: workoutWeek.weekNumber,
          trainerName: trainerLoc.name,
          emojis: [feedback.emoji],
          workoutName: workoutLoc.name,
          userEmail: feedback.account.email,
          environment: trainingProgramme.trainingProgramme.environment,
          date: feedback.createdAt,
        };
      }),
    );
  }

  public async feedback(id: string) {
    const [res] = await this.all(0, 1, 'created_at', 'ASC', {}, id);
    return res;
  }

  public async count(filter: UserWorkoutFeedbackFilter = {}) {
    const res = await applyFilter(
      UserWorkoutFeedback.query(),
      filter,
    ).resultSize();
    return { count: res };
  }
}

export interface UserWorkoutFeedbackFilter {
  id?: string;
  ids?: string[];
  emoji?: string;
  feedbackIntensity?: number;
  timeTaken?: number;
}

const applyFilter = (
  query: Objection.QueryBuilder<UserWorkoutFeedback, UserWorkoutFeedback[]>,
  filter: UserWorkoutFeedbackFilter,
): Objection.QueryBuilder<UserWorkoutFeedback, UserWorkoutFeedback[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  if (filter.emoji) {
    query.where('emoji', filter.emoji);
  }

  if (filter.feedbackIntensity) {
    query.where('feedback_intensity', filter.feedbackIntensity);
  }

  if (filter.timeTaken) {
    query.where('time_taken', filter.timeTaken);
  }

  return query;
};
