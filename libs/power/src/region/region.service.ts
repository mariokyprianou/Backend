import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { Region } from './region.model';

@Injectable()
export class RegionService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'region',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: RegionFilter = {},
  ) {
    const findAllQuery = applyFilter(
      Region.query().withGraphFetched('country'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: RegionFilter = {}) {
    return applyFilter(Region.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public delete(id: string) {
    return Region.query().findById(id).delete();
  }
}

export interface RegionFilter {
  id?: string;
  ids?: string[];
}

const applyFilter = (
  query: Objection.QueryBuilder<Region, Region[]>,
  filter: RegionFilter,
): Objection.QueryBuilder<Region, Region[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};
