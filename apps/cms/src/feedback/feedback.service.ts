import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { UserWorkout } from '@lib/power/user-workout';

@Injectable()
export class FeedbackService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: FeedbackFilter = {},
  ) {
    const findAllQuery = applyFilter(
      UserWorkout.query()
        .withGraphJoined('workout')
        .withGraphJoined('workout.trainingProgramme')
        .withGraphJoined('workout.trainingProgramme.trainer')
        .withGraphJoined('workout.trainingProgramme.trainer.localisations')
        .withGraphJoined('userWorkoutWeek'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: FeedbackFilter = {}) {
    return applyFilter(UserWorkout.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }
}

const applyFilter = (
  query: Objection.QueryBuilder<UserWorkout, UserWorkout[]>,
  filter: FeedbackFilter,
): Objection.QueryBuilder<UserWorkout, UserWorkout[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};

export interface FeedbackFilter {
  id?: string;
  ids?: string[];
}
