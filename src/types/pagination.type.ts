export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
