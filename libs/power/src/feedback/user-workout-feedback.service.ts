import { ICmsParams } from '@lib/common';
import { applyPagination } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { GenerateCsvReportService } from '@td/generate-csv-report';
import { format } from 'date-fns';
import { raw } from 'objection';
import { ProgrammeEnvironment } from '../types';
import { UserWorkout } from '../user-workout';
import { UserWorkoutFeedback } from './user-workout-feedback.model';

interface FeedbackRow {
  id: string;
  week: number;
  trainerName: string;
  workoutName: string;
  environment: ProgrammeEnvironment;
}

@Injectable()
export class UserWorkoutFeedbackService {
  constructor(private reportService: GenerateCsvReportService) {}

  public async findAll(params: ICmsParams<UserWorkoutFeedbackFilter>) {
    const query = this.baseQuery(params);

    let sortField = null;
    switch (params.sortField) {
      case 'date':
      default:
        sortField = 'created_at';
    }
    applyPagination(query, {
      page: params.page,
      perPage: params.perPage,
      sortField: sortField,
      sortOrder: params.sortOrder,
    });

    const feedbacks = await query;

    return feedbacks
      .map((feedback) => {
        return {
          id: feedback.id,
          date: feedback.createdAt,
          emojis: [feedback.emoji],
          environment: feedback.environment,
          timeTaken: feedback.timeTaken,
          trainerName: feedback.trainerName,
          userEmail: feedback.account.email,
          week: feedback.workoutWeekNumber,
          workoutIntensity: feedback.feedbackIntensity,
          workoutName: feedback.workoutName,
        };
      })
      .filter((x) => !!x);
  }

  private baseQuery(params: ICmsParams<UserWorkoutFeedbackFilter>) {
    const query = UserWorkoutFeedback.query()
      .alias('feedback')
      .joinRelated('account')
      .withGraphFetched('account');

    if (params.filter) {
      if (params.filter.id) {
        query.findById(params.filter.id);
      }
      if (params.filter.ids) {
        query.findByIds(params.filter.ids);
      }
      if (params.filter.emoji) {
        query.where('feedback.emoji', params.filter.emoji);
      }

      if (params.filter.feedbackIntensity) {
        query.where(
          'feedback.feedback_intensity',
          params.filter.feedbackIntensity,
        );
      }

      if (params.filter.timeTaken) {
        query.where('feedback.time_taken', params.filter.timeTaken);
      }

      if (params.filter.environment) {
        query.where('feedback.environment', params.filter.environment);
      }

      if (params.filter.trainerId) {
        query.where('feedback.trainer_id', params.filter.trainerId);
      }

      if (params.filter.weekNumber) {
        query.where('feedback.workout_week_number', params.filter.weekNumber);
      }

      if (params.filter.workoutName) {
        query.where(
          'feedback.workout_name',
          'ilike',
          raw(`'%' || ? || '%'`, [params.filter.workoutName]),
        );
      }

      if (params.filter.userEmail) {
        query.where(
          'account.email',
          'ilike',
          raw(`'%' || ? || '%'`, [params.filter.userEmail]),
        );
      }

      if (params.filter.dateFrom) {
        query.where('feedback.created_at', '>=', params.filter.dateFrom);
      }
      if (params.filter.dateTo) {
        query.where('feedback.created_at', '<', params.filter.dateTo);
      }
    }

    return query;
  }

  public async findById(feedbackId: string) {
    const feedback = await this.baseQuery({
      filter: { id: feedbackId },
    });

    if (feedback.length) {
      return feedback;
    } else {
      return null;
    }
  }

  public async findCount(params: ICmsParams<UserWorkoutFeedbackFilter>) {
    const count = await this.baseQuery(params).resultSize();
    return { count };
  }

  public async export() {
    const feedbacks = await UserWorkoutFeedback.query().withGraphFetched(
      'account',
    );

    const data = feedbacks
      .map((feedback) => {
        return {
          id: feedback.id,
          timeTaken: feedback.timeTaken,
          workoutIntensity: feedback.feedbackIntensity,
          week: feedback.workoutWeekNumber,
          trainerName: feedback.trainerName,
          emojis: [feedback.emoji],
          workoutName: feedback.workoutName,
          userEmail: feedback.account.email,
          environment: feedback.environment,
          date: format(new Date(feedback.createdAt), 'dd/MM/yyyy'),
        };
      })
      .filter((x) => !!x);

    return this.reportService.generateAndUploadCsv(data);
  }
}

export interface UserWorkoutFeedbackFilter {
  id?: string;
  ids?: string[];
  emoji?: string;
  environment?: ProgrammeEnvironment;
  feedbackIntensity?: number;
  timeTaken?: number;
  trainerId?: string;
  weekNumber?: number;
  workoutName?: string;
  userEmail?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

async function findWorkoutInfoForFeedback(workoutIds: string[]) {
  return await UserWorkout.knex()
    .raw<{ rows: FeedbackRow[] }>(
      `SELECT
  user_workout.id as "id",
  user_workout_week.week_number as "week",
  trainer_tr.name as "trainerName",
  workout_tr.name as "workoutName",
  training_programme.environment as "environment"
FROM user_workout
  JOIN user_workout_week ON user_workout_week.id = user_workout.user_workout_week_id
  JOIN workout ON user_workout.workout_id = workout.id
  LEFT JOIN workout_tr ON (workout.id = workout_tr.workout_id AND workout_tr.language = 'en')
  JOIN training_programme ON workout.training_programme_id = training_programme.id
  LEFT JOIN training_programme_tr ON (training_programme.id = training_programme_tr.training_programme_id AND training_programme_tr.language = 'en')
  JOIN trainer ON training_programme.trainer_id = trainer.id
  LEFT JOIN trainer_tr ON (trainer.id = trainer_tr.trainer_id AND trainer_tr.language = 'en')
WHERE user_workout.id IN (${workoutIds.map(() => '?').join(',')})`,
      workoutIds,
    )
    .then(({ rows }) => {
      const map = new Map<string, FeedbackRow>();
      for (const row of rows) {
        map.set(row.id, row);
      }
      return map;
    });
}
