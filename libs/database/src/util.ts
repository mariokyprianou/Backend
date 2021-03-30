import { OrderByDirection, QueryBuilder } from 'objection';

export const applyPagination = (
  query: QueryBuilder<any>,
  props: {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: OrderByDirection;
  },
) => {
  const { perPage = 25, page = 0, sortField, sortOrder = 'ASC' } = props;

  query.limit(perPage).offset(perPage * page);

  if (sortField) {
    query.orderBy(sortField, sortOrder);
  }

  return query;
};
