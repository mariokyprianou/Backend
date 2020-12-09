import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { User } from './user.model';

@Injectable()
export class UserService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'first_name',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserFilter = {},
  ) {
    const findAllQuery = applyFilter(
      User.query()
        .withGraphJoined('localisations')
        .withGraphJoined('programmeScores'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: UserFilter = {}) {
    return applyFilter(User.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }
}

export interface UserFilter {
  id?: string;
  ids?: string[];
}

const applyFilter = (
  query: Objection.QueryBuilder<User, User[]>,
  filter: UserFilter,
): Objection.QueryBuilder<User, User[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};
