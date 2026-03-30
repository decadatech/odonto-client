"use client"

import * as React from "react"
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs"

import type { FacetKey, AppointmentStatuses } from "../../types"

type ScheduleFacetSelections = Record<FacetKey, string[]>

const SCHEDULE_STATUS_VALUES: AppointmentStatuses[] = ["scheduled", "confirmed", "cancelled"] as const

const scheduleFiltersParsers = {
  dentists: parseAsArrayOf(parseAsString).withDefault([]),
  patients: parseAsArrayOf(parseAsString).withDefault([]),
  statuses: parseAsArrayOf(parseAsStringLiteral(SCHEDULE_STATUS_VALUES)).withDefault([]),
}

export function useScheduleFiltersQueryState() {
  const [
    {
      dentists,
      patients,
      statuses,
    },
    setFilters,
  ] = useQueryStates(scheduleFiltersParsers, {
    history: "replace",
  })


  const toggleOption = React.useCallback((facetKey: FacetKey, value: string) => {
    void setFilters((current) => {
      if (facetKey === "statuses") {
        const statusValue = value as AppointmentStatuses
        const isSelected = current.statuses.includes(statusValue)

        return {
          statuses: isSelected
            ? current.statuses.filter((currentValue) => currentValue !== statusValue)
            : [...current.statuses, statusValue],
        }
      }

      const currentValues = current[facetKey]
      const isSelected = currentValues.includes(value)

      return {
        [facetKey]: isSelected
          ? currentValues.filter((currentValue) => currentValue !== value)
          : [...currentValues, value],
      }
    })
  }, [setFilters])

  const resetFacet = React.useCallback((facetKey: FacetKey) => {
    void setFilters({
      [facetKey]: [],
    })
  }, [setFilters])

  const resetAll = React.useCallback(() => {
    void setFilters({
      dentists: [],
      patients: [],
      statuses: [],
    })
  }, [setFilters])

  const selectedValues = React.useMemo<ScheduleFacetSelections>(
    () => ({
      dentists,
      patients,
      statuses,
    }),
    [dentists, patients, statuses],
  )

  return {
    resetAll,
    resetFacet,
    selectedValues,
    toggleOption,
  }
}
