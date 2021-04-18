import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { UserWorkout } from './user-workout.model';

// Note: this is untested
@Injectable()
export class UserWorkoutCmsService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserWorkoutFilter = {},
  ) {
    const findAllQuery = applyFilter(UserWorkout.query(), filter);

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: UserWorkoutFilter = {}) {
    return applyFilter(UserWorkout.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }
}

const applyFilter = (
  query: Objection.QueryBuilder<UserWorkout, UserWorkout[]>,
  filter: UserWorkoutFilter,
): Objection.QueryBuilder<UserWorkout, UserWorkout[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};

export interface UserWorkoutFilter {
  id?: string;
  ids?: string[];
}
