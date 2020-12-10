import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { UserProgramme } from './user-programme.model';

@Injectable()
export class UserProgrammeService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'start_date',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserProgramFilter = {},
  ) {
    const findAllQuery = applyFilter(
      UserProgramme.query()
        // Note: these withGraphFetched were needed by the CMS,
        // but they will likely be needed in most cases
        .withGraphFetched('programme')
        .withGraphFetched('programme.localisations'),
      filter,
    );

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

export interface UserProgramFilter {
  id?: string;
  ids?: string[];
  accountID?: string;
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

  if (filter.accountID) {
    query.where('account_id', filter.accountID);
  }

  return query;
};
