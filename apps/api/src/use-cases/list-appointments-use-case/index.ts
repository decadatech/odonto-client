import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { appointments, patients, users } from "../../db/schema"
import { listAppointmentsResponseSchema } from "../../schemas/appointments"

export type ListAppointmentsUseCaseInput = {
  orgId: string
}

export type ListAppointmentsUseCaseOutput = z.infer<typeof listAppointmentsResponseSchema>

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
    .where(eq(appointments.orgId, input.orgId))

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
