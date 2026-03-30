import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { listPatientsAction } from "@/app/actions/patients"
import type { Pagination, SortOrder } from "@/types/api"

type ListPatientsResult = Awaited<ReturnType<typeof listPatientsAction>>

interface UsePatientsQueryOptions {
  sortBy?: Pagination["sort_by"]
  sortOrder?: SortOrder
  search?: string
  limit?: number
}

function getPatientsQueryKey({
  search,
  sortBy,
  sortOrder,
  limit,
}: UsePatientsQueryOptions = {}) {
  return [
    "patients",
    {
      search: search ?? "",
      sortBy: sortBy ?? "name",
      sortOrder: sortOrder ?? "asc",
      limit: limit ?? 20,
    },
  ] as const
}

function getInfinitePatientsQueryKey({
  search,
  sortBy,
  sortOrder,
  limit,
}: UsePatientsQueryOptions = {}) {
  return [
    "patients",
    "infinite",
    {
      search: search ?? "",
      sortBy: sortBy ?? "name",
      sortOrder: sortOrder ?? "asc",
      limit: limit ?? 20,
    },
  ] as const
}

export function usePatientsQuery({
  search,
  sortBy,
  sortOrder,
  limit = 20,
}: UsePatientsQueryOptions = {}) {
  return useQuery<ListPatientsResult>({
    queryKey: getPatientsQueryKey({ search, sortBy, sortOrder, limit }),
    queryFn: () =>
      listPatientsAction({
        search,
        sortBy,
        sortOrder,
        limit,
      }),
  })
}

export function useInfinitePatientsQuery({
  search,
  sortBy,
  sortOrder,
  limit = 20,
}: UsePatientsQueryOptions = {}) {
  return useInfiniteQuery<ListPatientsResult>({
    queryKey: getInfinitePatientsQueryKey({ search, sortBy, sortOrder, limit }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      listPatientsAction({
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        search,
        sortBy,
        sortOrder,
        limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
