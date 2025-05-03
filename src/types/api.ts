export interface Pagination {
  total: number;
  page: number;
  items_per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
