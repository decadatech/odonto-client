"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"

import {
  FacetFilter,
  type FacetFilterOption,
} from "@/components/facet-filter"
import { useScheduleFiltersQueryState } from "./hooks/use-schedule-filters-query-state"
import { useDebounce } from "@/hooks/use-debounce"
import { usePatientsQuery } from "@/hooks/queries/patients"
import { Button } from "@workspace/ui/components/button"
import type { AppointmentStatuses, FacetKey } from "./types"

interface FacetConfig {
  key: FacetKey
  title: string
  options: FacetFilterOption[]
}

interface ScheduleFacetedFiltersProps {
  dentists: FacetFilterOption[]
}

const STATUS_OPTIONS: Array<{ value: AppointmentStatuses, label: string }> = [
  { value: "scheduled", label: "Agendado" },
  { value: "confirmed", label: "Confirmado" },
  { value: "cancelled", label: "Cancelado" },
]

const FACETS: FacetConfig[] = [
  {
    key: "statuses",
    title: "Status",
    options: STATUS_OPTIONS,
  },
]

const DENTISTS_FACET_KEY: FacetKey = "dentists"
const PATIENTS_FACET_KEY: FacetKey = "patients"

export function ScheduleFacetedFilters({
  dentists,
}: ScheduleFacetedFiltersProps) {
  const [knownPatientOptions, setKnownPatientOptions] = React.useState<Record<string, FacetFilterOption>>({})
  const [patientSearch, setPatientSearch] = React.useState("")
  const debouncedPatientSearch = useDebounce(patientSearch, 300)

  const {
    resetAll,
    resetFacet,
    selectedValues,
    toggleOption,
  } = useScheduleFiltersQueryState()

  const {
    data: patientsPage,
    isPending,
    isFetching,
  } = usePatientsQuery({
    search: debouncedPatientSearch,
    limit: 5,
  })

  const patientOptions = React.useMemo<FacetFilterOption[]>(
    () => patientsPage?.items.map((patient) => ({
      value: patient.id,
      label: patient.name,
    })) ?? [],
    [patientsPage],
  )

  const facets = React.useMemo<FacetConfig[]>(
    () => [
      {
        key: DENTISTS_FACET_KEY,
        title: "Dentistas",
        options: dentists,
      },
      {
        key: PATIENTS_FACET_KEY,
        title: "Pacientes",
        options: patientOptions,
      },
      ...FACETS,
    ],
    [dentists, patientOptions],
  )

  React.useEffect(() => {
    if (patientOptions.length === 0) {
      return
    }

    setKnownPatientOptions((current) => {
      const nextOptions = { ...current }

      for (const option of patientOptions) {
        nextOptions[option.value] = option
      }

      return nextOptions
    })
  }, [patientOptions])

  const handleResetFacet = React.useCallback((facetKey: FacetKey) => {
    if (facetKey === PATIENTS_FACET_KEY) {
      setPatientSearch("")
    }

    resetFacet(facetKey)
  }, [resetFacet])

  const handleResetAll = React.useCallback(() => {
    setPatientSearch("")
    resetAll()
  }, [resetAll])

  const allPatientOptions = React.useMemo(
    () => Object.values(knownPatientOptions),
    [knownPatientOptions],
  )

  const isPatientsLoading = patientSearch !== debouncedPatientSearch || isPending || isFetching

  const hasActiveFilters =
    facets.some((facet) => selectedValues[facet.key].length > 0) || patientSearch.length > 0

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {facets.map((facet) => {
        const options = facet.key === PATIENTS_FACET_KEY ? patientOptions : facet.options

        return (
          <FacetFilter
            key={facet.key}
            title={facet.title}
            options={options}
            allOptions={facet.key === PATIENTS_FACET_KEY ? allPatientOptions : facet.options}
            selectedValues={selectedValues[facet.key]}
            onToggle={(value) => toggleOption(facet.key, value)}
            onReset={() => handleResetFacet(facet.key)}
            searchValue={facet.key === PATIENTS_FACET_KEY ? patientSearch : undefined}
            onSearchChange={facet.key === PATIENTS_FACET_KEY ? setPatientSearch : undefined}
            searchPlaceholder={facet.key === PATIENTS_FACET_KEY ? "Buscar paciente..." : undefined}
            emptyMessage={
              facet.key === DENTISTS_FACET_KEY
                ? "Nenhum dentista encontrado."
                : facet.key === PATIENTS_FACET_KEY
                  ? "Nenhum paciente encontrado."
                  : undefined
            }
            isLoading={facet.key === PATIENTS_FACET_KEY ? isPatientsLoading : undefined}
            loadingMessage={facet.key === PATIENTS_FACET_KEY ? "Buscando pacientes..." : undefined}
          />
        )
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 px-3 text-muted-foreground hover:text-foreground"
        onClick={handleResetAll}
        disabled={!hasActiveFilters}
      >
        <RotateCcw className="size-4" />
        Redefinir filtros
      </Button>
    </div>
  )
}
