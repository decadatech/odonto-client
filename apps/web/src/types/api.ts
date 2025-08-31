export interface Pagination {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page: number;
  items_per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
