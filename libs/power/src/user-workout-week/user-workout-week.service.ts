import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { UserWorkoutWeek } from './user-workout-week.model';

// NOTE: this is untested
@Injectable()
export class UserWorkoutWeekService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserWorkoutWeekFilter = {},
  ) {
    const findAllQuery = applyFilter(UserWorkoutWeek.query(), filter);

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: UserWorkoutWeekFilter = {}) {
    return applyFilter(UserWorkoutWeek.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }
}

const applyFilter = (
  query: Objection.QueryBuilder<UserWorkoutWeek, UserWorkoutWeek[]>,
  filter: UserWorkoutWeekFilter,
): Objection.QueryBuilder<UserWorkoutWeek, UserWorkoutWeek[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};

export interface UserWorkoutWeekFilter {
  id?: string;
  ids?: string[];
}
