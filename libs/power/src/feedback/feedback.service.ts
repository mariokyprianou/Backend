import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { Feedback } from './feedback.model';

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
      Feedback.query()
        .withGraphJoined('localisations')
        .withGraphJoined('programmeScores'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: FeedbackFilter = {}) {
    return applyFilter(Feedback.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }
}

const applyFilter = (
  query: Objection.QueryBuilder<Feedback, Feedback[]>,
  filter: FeedbackFilter,
): Objection.QueryBuilder<Feedback, Feedback[]> => {
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
