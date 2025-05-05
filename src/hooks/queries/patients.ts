import { useInfiniteQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { Patient } from "@/types/patient";
import type { PaginatedResponse } from "@/types/api";

interface UseInfinitePatientsOptions {
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export function useInfinitePatients({ sort_order, search }: UseInfinitePatientsOptions = {}) {
  return useInfiniteQuery<PaginatedResponse<Patient>>({
    queryKey: ["patients", { search, sort_order }],
    queryFn: async ({ pageParam }) => {
      const response = await api.get("/pacientes", {
        params: {
          search,
          page: Number(pageParam) || 1,
          sort_order: sort_order,
          sort_by: 'nome',
        }
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      const hasNextPage = pagination.page * pagination.items_per_page < pagination.total;
      return hasNextPage ? pagination.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const { pagination } = firstPage;
      const hasPreviousPage = pagination.page > 1;
      return hasPreviousPage ? pagination.page - 1 : undefined;
    },
    placeholderData: (data) => {
      return data;
    }
  });
}
