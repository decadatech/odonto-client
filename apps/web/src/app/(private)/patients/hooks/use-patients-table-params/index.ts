"use client"

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"

import type { SortOrder } from "@/types/api"

const SORT_ORDER_VALUES: SortOrder[] = ["asc", "desc"] as const

const patientsTableParamsParsers = {
  search: parseAsString.withDefault(""),
  sort_order: parseAsStringLiteral(SORT_ORDER_VALUES).withDefault("asc"),
}

export function usePatientsTableParams() {
  const [
    {
      search,
      sort_order,
    },
    setQueryState,
  ] = useQueryStates(patientsTableParamsParsers, {
    history: "replace",
  })

  return {
    search,
    setSearch: (value: string) => setQueryState({ search: value || null }),
    sortOrder: sort_order,
    setSortOrder: (value: SortOrder) => setQueryState({ sort_order: value }),
  }
}
