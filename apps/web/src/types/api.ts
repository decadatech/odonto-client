export type SortOrder = "asc" | "desc"

export interface Pagination {
  sort_by?: string;
  sort_order?: SortOrder;
  page: number;
  items_per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
