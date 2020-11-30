export const constructLimits = (
  query: any,
  props: {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: string;
  },
) => {
  const {
    perPage = 25,
    page = 0,
    sortField = 'name',
    sortOrder = 'ASC',
  } = props;
  return query
    .limit(perPage)
    .offset(perPage * page)
    .orderBy(sortField, sortOrder);
};
