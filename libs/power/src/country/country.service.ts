import { Injectable } from '@nestjs/common';
import Objection, { ref } from 'objection';
import { Country } from './country.model';

@Injectable()
export class CountryService {
  // optimised for app use
  public getAll(language = 'en') {
    return Country.query()
      .select('country.id', 'localisations.name as name', 'code')
      .withGraphJoined('localisations')
      .modifyGraph('localisations', (qb) => qb.where(ref('language'), language))
      .orderBy('order_index');
  }

  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'country',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: CountryFilter = {},
  ) {
    const findAllQuery = applyFilter(
      Country.query().withGraphFetched('[localisations]'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: CountryFilter = {}) {
    return applyFilter(Country.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public delete(id: string) {
    return Country.query().findById(id).delete();
  }
}

export interface CountryFilter {
  id?: string;
  ids?: string[];
}

const applyFilter = (
  query: Objection.QueryBuilder<Country, Country[]>,
  filter: CountryFilter,
): Objection.QueryBuilder<Country, Country[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};
