import { listAppointmentsAction } from "@/app/actions/appointments"
import { listPatientsAction } from "@/app/actions/patients"
import { listDentistsAction } from "@/app/actions/users"
import type {
  ScheduleAppointmentColor,
  ScheduleDentistOption,
} from "@/components/schedule/types"
import { getViewTimeframe } from "@/components/schedule/utils"

import { SchedulePageContent } from "./schedule-page-content"

export default async function Dashboard() {
  const initialTimeframe = getViewTimeframe(new Date(), "week")

  const [patientsPage, dentists, appointments] = await Promise.all([
    listPatientsAction(),
    listDentistsAction(),
    listAppointmentsAction({
      from: initialTimeframe.from.toISOString(),
      to: initialTimeframe.to.toISOString(),
    }),
  ])

  const dentistColors: ScheduleAppointmentColor[] = ["teal", "amber", "rose", "violet", "sky"]
  const dentistsWithColor: ScheduleDentistOption[] = dentists.map((dentist, index) => ({
    ...dentist,
    color: dentistColors[index % dentistColors.length]!,
  }))

  return (
    <SchedulePageContent
      breadcrumbs={[
        { label: "Página inicial", href: "/" },
      ]}
      initialAppointments={appointments}
      initialTimeframe={{
        from: initialTimeframe.from.toISOString(),
        to: initialTimeframe.to.toISOString(),
      }}
      dentists={dentistsWithColor}
      patients={patientsPage.items.map((patient) => ({
        id: patient.id,
        name: patient.name,
      }))}
    />
  )
}
