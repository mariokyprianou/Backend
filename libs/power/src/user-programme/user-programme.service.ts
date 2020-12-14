import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { UserProgramme } from './user-programme.model';

@Injectable()
export class UserProgrammeService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserProgramFilter = {},
  ) {
    const findAllQuery = applyFilter(UserProgramme.query(), filter);

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: UserProgramFilter = {}) {
    return applyFilter(UserProgramme.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }
}

const applyFilter = (
  query: Objection.QueryBuilder<UserProgramme, UserProgramme[]>,
  filter: UserProgramFilter,
): Objection.QueryBuilder<UserProgramme, UserProgramme[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};

export interface UserProgramFilter {
  id?: string;
  ids?: string[];
}
