import { listAppointmentsAction } from "@/app/actions/appointments"
import { listPatientsAction } from "@/app/actions/patients"
import { listDentistsAction } from "@/app/actions/users"
import type { ScheduleAppointment } from "@/components/schedule"
import type {
  ScheduleAppointmentColor,
  ScheduleDentistOption,
} from "@/components/schedule/types"

import { SchedulePageContent } from "./schedule-page-content"

export default async function Dashboard() {
  const [patients, dentists, appointments] = await Promise.all([
    listPatientsAction(),
    listDentistsAction(),
    listAppointmentsAction(),
  ])

  const dentistColors: ScheduleAppointmentColor[] = ["teal", "amber", "rose", "violet", "sky"]
  const dentistsWithColor: ScheduleDentistOption[] = dentists.map((dentist, index) => ({
    ...dentist,
    color: dentistColors[index % dentistColors.length]!,
  }))

  const dentistColorById = new Map(dentistsWithColor.map((dentist) => [dentist.id, dentist.color]))

  const mappedAppointments: ScheduleAppointment[] = appointments.map((appointment) => ({
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

  return (
    <SchedulePageContent
      breadcrumbs={[
        { label: "Página inicial", href: "/" },
      ]}
      initialAppointments={mappedAppointments}
      dentists={dentistsWithColor}
      patients={patients.map((patient) => ({
        id: patient.id,
        name: patient.nome,
      }))}
    />
  )
}
