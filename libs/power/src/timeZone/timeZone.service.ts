import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { TimeZone } from './timeZone.model';

@Injectable()
export class TimeZoneService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'time_zone',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: TimeZoneFilter = {},
  ) {
    const findAllQuery = applyFilter(TimeZone.query(), filter);

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: TimeZoneFilter = {}) {
    return applyFilter(TimeZone.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public delete(id: string) {
    return TimeZone.query().findById(id).delete();
  }
}

export interface TimeZoneFilter {
  id?: string;
  ids?: string[];
}

const applyFilter = (
  query: Objection.QueryBuilder<TimeZone, TimeZone[]>,
  filter: TimeZoneFilter,
): Objection.QueryBuilder<TimeZone, TimeZone[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};
