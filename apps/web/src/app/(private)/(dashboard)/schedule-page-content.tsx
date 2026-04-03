"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { updateAppointmentAction } from "@/app/actions/appointments"
import type { FacetFilterOption } from "@/components/facet-filter"
import { Schedule, type ScheduleAppointment } from "@/components/schedule"
import { ScheduleFacetedFilters } from "@/components/schedule"
import { useScheduleFiltersQueryState } from "@/components/schedule/components/schedule-faceted-filters/hooks/use-schedule-filters-query-state"
import type {
  ScheduleAppointmentDraft,
  ScheduleDentistOption,
  SchedulePatientOption,
  ScheduleTimeframe,
} from "@/components/schedule/types"
import { getViewTimeframe } from "@/components/schedule/utils"
import type { BreadcrumbItem } from "@/contexts/breadcrumbs"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import { getAppointmentsQueryKey, useAppointmentsQuery } from "@/hooks/queries/appointments"
import { listAppointmentsResponseSchema } from "@/schemas/appointments"
import { toast } from "@workspace/ui/components/sonner"

import { CreateAppointmentSheet } from "./create-appointment-sheet"

type AppointmentsResponse = z.infer<typeof listAppointmentsResponseSchema>

interface SchedulePageContentProps {
  breadcrumbs: BreadcrumbItem[]
  initialAppointments: AppointmentsResponse
  initialTimeframe: {
    from: string
    to: string
  }
  dentists: ScheduleDentistOption[]
  patients: SchedulePatientOption[]
}

function mapAppointmentsToSchedule(
  appointments: AppointmentsResponse,
  dentists: ScheduleDentistOption[],
): ScheduleAppointment[] {
  const dentistColorById = new Map(dentists.map((dentist) => [dentist.id, dentist.color]))

  return appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    description: appointment.description ?? undefined,
    start: new Date(appointment.startsAt),
    end: new Date(appointment.endsAt),
    dentistId: appointment.dentist.id,
    dentistName: appointment.dentist.name,
    patientName: appointment.patient.name,
    color: dentistColorById.get(appointment.dentist.id),
    status: "scheduled",
  }))
}

export function SchedulePageContent({
  breadcrumbs,
  initialAppointments,
  initialTimeframe,
  dentists,
  patients,
}: SchedulePageContentProps) {
  const queryClient = useQueryClient()
  const { selectedValues } = useScheduleFiltersQueryState()
  const [timeframe, setTimeframe] = useState(() => {
    const fallbackTimeframe = getViewTimeframe(new Date(), "week")

    return {
      from: initialTimeframe.from || fallbackTimeframe.from.toISOString(),
      to: initialTimeframe.to || fallbackTimeframe.to.toISOString(),
    }
  })
  const patientIds = selectedValues.patients
  const dentistUserIds = selectedValues.dentists
  const hasAppointmentFilters = patientIds.length > 0 || dentistUserIds.length > 0
  const isUsingInitialTimeframe =
    timeframe.from === initialTimeframe.from && timeframe.to === initialTimeframe.to
  const { data: appointmentsResponse = initialAppointments } = useAppointmentsQuery(
    !hasAppointmentFilters && isUsingInitialTimeframe ? initialAppointments : undefined,
    {
      from: timeframe.from,
      to: timeframe.to,
      patientIds,
      dentistUserIds,
    },
    { placeholderData: (data) => data }
  )
  const appointmentsFromServer = useMemo(
    () => mapAppointmentsToSchedule(appointmentsResponse, dentists),
    [appointmentsResponse, dentists],
  )
  const dentistFacetOptions = useMemo<FacetFilterOption[]>(
    () => dentists.map((dentist) => ({
      value: dentist.id,
      label: dentist.name,
    })),
    [dentists],
  )
  const [appointments, setAppointments] = useState<ScheduleAppointment[]>(appointmentsFromServer)
  const [createDraft, setCreateDraft] = useState<ScheduleAppointmentDraft | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  const handleTimeframeChange = useCallback((nextTimeframe: ScheduleTimeframe) => {
    const nextFrom = nextTimeframe.from.toISOString()
    const nextTo = nextTimeframe.to.toISOString()

    setTimeframe((current) => {
      if (current.from === nextFrom && current.to === nextTo) {
        return current
      }

      return {
        from: nextFrom,
        to: nextTo,
      }
    })
  }, [])

  useEffect(() => {
    setBreadcrumbs(breadcrumbs)

    return () => {
      setBreadcrumbs([])
    }
  }, [breadcrumbs, setBreadcrumbs])

  useEffect(() => {
    setAppointments(appointmentsFromServer)
  }, [appointmentsFromServer])

  function handleCreateAppointment(appointment: ScheduleAppointment) {
    setAppointments((current) => [...current, appointment])
    void queryClient.invalidateQueries({
      queryKey: ["appointments"],
    })
  }

  function handleOpenCreateAppointment(draft?: ScheduleAppointmentDraft) {
    setCreateDraft(draft ?? null)
    setIsCreateOpen(true)
  }

  function handleCreateSheetOpenChange(nextOpen: boolean) {
    setIsCreateOpen(nextOpen)

    if (!nextOpen) {
      setCreateDraft(null)
    }
  }

  function handleMoveAppointment(appointmentId: string, start: Date, end: Date) {
    const previousAppointment = appointments.find((appointment) => appointment.id === appointmentId)
    const previousAppointmentsResponse = queryClient.getQueryData<AppointmentsResponse>(
      getAppointmentsQueryKey({
        from: timeframe.from,
        to: timeframe.to,
        patientIds,
        dentistUserIds,
      }),
    )

    if (!previousAppointment) {
      return
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentId
          ? {
            ...appointment,
            start,
            end,
          }
          : appointment,
      ),
    )

    queryClient.setQueryData<AppointmentsResponse>(
      getAppointmentsQueryKey({
        from: timeframe.from,
        to: timeframe.to,
        patientIds,
        dentistUserIds,
      }),
      (current) => {
        if (!current) {
          return current
        }

        return current.map((appointment) =>
          appointment.id === appointmentId
            ? {
              ...appointment,
              startsAt: start.toISOString(),
              endsAt: end.toISOString(),
            }
            : appointment,
        )
      },
    )

    const payload = new FormData()
    payload.set("startsAt", start.toISOString())
    payload.set("endsAt", end.toISOString())

    void updateAppointmentAction(appointmentId, {}, payload).then((result) => {
      if (result.code) {
        setAppointments((current) =>
          current.map((appointment) =>
            appointment.id === appointmentId
              ? previousAppointment
              : appointment,
          ),
        )

        if (previousAppointmentsResponse) {
          queryClient.setQueryData(
            getAppointmentsQueryKey({
              from: timeframe.from,
              to: timeframe.to,
              patientIds,
              dentistUserIds,
            }),
            previousAppointmentsResponse,
          )
        }

        toast.error("Não foi possível atualizar o agendamento.")
        return
      }

      void queryClient.invalidateQueries({
        queryKey: ["appointments"],
      })
    })
  }

  return (
    <div className="p-6">
      <ScheduleFacetedFilters dentists={dentistFacetOptions} />

      <Schedule
        appointments={appointments}
        onCreateAppointment={handleOpenCreateAppointment}
        onAppointmentMove={handleMoveAppointment}
        onTimeframeChange={handleTimeframeChange}
      />

      <CreateAppointmentSheet
        open={isCreateOpen}
        onOpenChange={handleCreateSheetOpenChange}
        dentists={dentists}
        patients={patients}
        initialDraft={createDraft}
        onCreateAppointment={handleCreateAppointment}
      />
    </div>
  )
}
