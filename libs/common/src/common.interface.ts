export interface ICmsParams<T extends ICmsFilter = ICmsFilter> {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  filter?: T;
}

export interface ICmsFilter {
  id?: string;
  ids?: string[];
}

export interface PageInfo {
  endCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
}

export interface Connection<T> {
  nodes: T[];
  pageInfo: PageInfo;
}
