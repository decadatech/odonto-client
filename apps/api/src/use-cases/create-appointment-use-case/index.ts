import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { patients, appointments, users } from "../../db/schema"
import { AppError } from "../../http/errors/app-error"
import { createAppointmentResponseSchema } from "../../schemas/appointments"

export type CreateAppointmentUseCaseInput = {
  orgId: string
  patientId: string
  dentistUserId: string
  startsAt: string
  endsAt: string
  title: string
  description?: string | null
}

export type CreateAppointmentUseCaseOutput = z.infer<typeof createAppointmentResponseSchema>

export async function createAppointmentUseCase(
  input: CreateAppointmentUseCaseInput,
): Promise<CreateAppointmentUseCaseOutput> {
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, input.orgId),
        eq(patients.id, input.patientId),
      ),
    )
    .limit(1)

  if (!patient) {
    throw new AppError(404, "APPOINTMENT_PATIENT_NOT_FOUND", "Patient not found")
  }

  const [dentist] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(
      and(
        eq(users.orgId, input.orgId),
        eq(users.id, input.dentistUserId),
      ),
    )
    .limit(1)

  if (!dentist || dentist.role !== "dentist") {
    throw new AppError(404, "APPOINTMENT_DENTIST_NOT_FOUND", "Dentist not found")
  }

  const [appointment] = await db
    .insert(appointments)
    .values({
      orgId: input.orgId,
      patientId: input.patientId,
      dentistUserId: input.dentistUserId,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      title: input.title,
      description: input.description ?? null,
    })
    .returning()

  return toAppointmentOutput(appointment!)
}

function toAppointmentOutput(
  appointment: typeof appointments.$inferSelect,
): CreateAppointmentUseCaseOutput {
  return {
    ...appointment,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  }
}
