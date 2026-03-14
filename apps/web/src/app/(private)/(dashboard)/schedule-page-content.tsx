"use client"

import { useEffect, useState } from "react"

import { updateAppointmentAction } from "@/app/actions/appointments"
import { Schedule, type ScheduleAppointment } from "@/components/schedule"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import type { BreadcrumbItem } from "@/contexts/breadcrumbs"
import { toast } from "@workspace/ui/components/sonner"
import type {
  ScheduleDentistOption,
  SchedulePatientOption,
} from "@/components/schedule/types"
import { CreateAppointmentSheet } from "./create-appointment-sheet"

interface SchedulePageContentProps {
  breadcrumbs: BreadcrumbItem[]
  initialAppointments: ScheduleAppointment[]
  dentists: ScheduleDentistOption[]
  patients: SchedulePatientOption[]
}

export function SchedulePageContent({
  breadcrumbs,
  initialAppointments,
  dentists,
  patients,
}: SchedulePageContentProps) {
  const [appointments, setAppointments] = useState<ScheduleAppointment[]>(initialAppointments)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs)

    return () => {
      setBreadcrumbs([])
    }
  }, [breadcrumbs, setBreadcrumbs])

  function handleCreateAppointment(appointment: ScheduleAppointment) {
    setAppointments((current) => [...current, appointment])
  }

  function handleMoveAppointment(appointmentId: string, start: Date, end: Date) {
    const previousAppointment = appointments.find((appointment) => appointment.id === appointmentId)

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

        toast.error("Não foi possível atualizar o agendamento.")
        return
      }

      if (!result.appointment) {
        return
      }

      const updatedAppointment = result.appointment

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? {
              ...appointment,
              start: new Date(updatedAppointment.startsAt),
              end: new Date(updatedAppointment.endsAt),
            }
            : appointment,
        ),
      )
    })
  }

  return (
    <div className="p-6">
      <Schedule
        appointments={appointments}
        onCreateAppointment={() => setIsCreateOpen(true)}
        onAppointmentMove={handleMoveAppointment}
      />

      <CreateAppointmentSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        dentists={dentists}
        patients={patients}
        onCreateAppointment={handleCreateAppointment}
      />
    </div>
  )
}
