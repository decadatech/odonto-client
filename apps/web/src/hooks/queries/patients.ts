import { useQuery } from "@tanstack/react-query"

import { listPatientsPageAction } from "@/app/actions/patients"

type SortOrder = "asc" | "desc"

type ListPatientsPageResult = Awaited<ReturnType<typeof listPatientsPageAction>>

interface UsePatientsQueryOptions {
  sortOrder?: SortOrder
  search?: string
  limit?: number
}

function getPatientsQueryKey({
  search,
  sortOrder,
  limit,
}: UsePatientsQueryOptions = {}) {
  return ["patients", { search: search ?? "", sortOrder: sortOrder ?? "asc", limit: limit ?? 20 }] as const
}

export function usePatientsQuery({
  search,
  sortOrder,
  limit = 20,
}: UsePatientsQueryOptions = {}) {
  return useQuery<ListPatientsPageResult>({
    queryKey: getPatientsQueryKey({ search, sortOrder, limit }),
    queryFn: () =>
      listPatientsPageAction({
        search,
        sortOrder,
        limit,
      }),
  })
}
