import { and, asc, eq, gt, inArray, lt } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { appointments, patients, users } from "../../db/schema"
import { listAppointmentsResponseSchema } from "../../schemas/appointments"

export type ListAppointmentsUseCaseInput = {
  orgId: string
  from?: string
  to?: string
  patientIds?: string[]
  dentistUserIds?: string[]
}

export type ListAppointmentsUseCaseOutput = z.infer<typeof listAppointmentsResponseSchema>

function buildFilters(input: ListAppointmentsUseCaseInput) {
  const filters = [eq(appointments.orgId, input.orgId)]

  if (input.from && input.to) {
    const from = new Date(input.from)
    const to = new Date(input.to)

    filters.push(lt(appointments.startsAt, to))
    filters.push(gt(appointments.endsAt, from))
  }

  if (input.patientIds && input.patientIds.length > 0) {
    filters.push(inArray(appointments.patientId, input.patientIds))
  }

  if (input.dentistUserIds && input.dentistUserIds.length > 0) {
    filters.push(inArray(appointments.dentistUserId, input.dentistUserIds))
  }

  return filters
}

export async function listAppointmentsUseCase(
  input: ListAppointmentsUseCaseInput,
): Promise<ListAppointmentsUseCaseOutput> {
  const result = await db
    .select({
      appointment: appointments,
      patient: {
        id: patients.id,
        name: patients.name,
      },
      dentist: {
        id: users.id,
        name: users.name,
      },
    })
    .from(appointments)
    .innerJoin(
      patients,
      eq(appointments.patientId, patients.id),
    )
    .innerJoin(
      users,
      eq(appointments.dentistUserId, users.id),
    )
    .where(and(...buildFilters(input)))
    .orderBy(asc(appointments.startsAt), asc(appointments.id))

  return result.map((row) => ({
    ...row.appointment,
    patient: row.patient,
    dentist: row.dentist,
    startsAt: row.appointment.startsAt.toISOString(),
    endsAt: row.appointment.endsAt.toISOString(),
    createdAt: row.appointment.createdAt.toISOString(),
    updatedAt: row.appointment.updatedAt.toISOString(),
  }))
}
