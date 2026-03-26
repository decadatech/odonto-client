import { useQuery } from "@tanstack/react-query"

import { listPatientsAction } from "@/app/actions/patients"

type SortOrder = "asc" | "desc"

interface UsePatientsQueryOptions {
  sortOrder?: SortOrder
  search?: string
}

export function getPatientsQueryKey({ search, sortOrder }: UsePatientsQueryOptions = {}) {
  return ["patients", { search: search ?? "", sortOrder: sortOrder ?? "asc" }] as const
}

export function usePatientsQuery({ search, sortOrder }: UsePatientsQueryOptions = {}) {
  return useQuery({
    queryKey: getPatientsQueryKey({ search, sortOrder }),
    queryFn: () =>
      listPatientsAction({
        search,
        sortOrder,
      }),
  })
}
