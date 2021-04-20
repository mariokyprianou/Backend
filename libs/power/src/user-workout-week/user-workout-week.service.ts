import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { UserWorkoutWeek } from './user-workout-week.model';

@Injectable()
export class UserWorkoutWeekService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserWorkoutWeekFilter = {},
  ) {
    const query = UserWorkoutWeek.query();
    applyFilter(query, filter);
    query.limit(perPage).offset(perPage * page);
    query.orderBy(sortField, sortOrder);

    return query;
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
