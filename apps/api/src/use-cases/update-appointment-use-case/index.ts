import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { appointments, patients, users } from "../../db/schema"
import { AppError } from "../../http/errors/app-error"
import { updateAppointmentResponseSchema } from "../../schemas/appointments"

export type UpdateAppointmentUseCaseInput = {
  orgId: string
  appointmentId: string
  patientId?: string
  dentistUserId?: string
  startsAt?: string
  endsAt?: string
  title?: string
  description?: string | null
}

export type UpdateAppointmentUseCaseOutput = z.infer<typeof updateAppointmentResponseSchema>

export async function updateAppointmentUseCase(
  input: UpdateAppointmentUseCaseInput,
): Promise<UpdateAppointmentUseCaseOutput> {
  const [existingAppointment] = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.orgId, input.orgId),
        eq(appointments.id, input.appointmentId),
      ),
    )
    .limit(1)

  if (!existingAppointment) {
    throw new AppError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found")
  }

  const nextPatientId = input.patientId ?? existingAppointment.patientId
  const nextDentistUserId = input.dentistUserId ?? existingAppointment.dentistUserId
  const nextStartsAt = input.startsAt ? new Date(input.startsAt) : existingAppointment.startsAt
  const nextEndsAt = input.endsAt ? new Date(input.endsAt) : existingAppointment.endsAt

  if (nextEndsAt.getTime() <= nextStartsAt.getTime()) {
    throw new AppError(400, "APPOINTMENT_INVALID_TIME_RANGE", "End date must be greater than start date")
  }

  if (input.patientId) {
    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(
        and(
          eq(patients.orgId, input.orgId),
          eq(patients.id, nextPatientId),
        ),
      )
      .limit(1)

    if (!patient) {
      throw new AppError(404, "APPOINTMENT_PATIENT_NOT_FOUND", "Patient not found")
    }
  }

  if (input.dentistUserId) {
    const [dentist] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(
        and(
          eq(users.orgId, input.orgId),
          eq(users.id, nextDentistUserId),
        ),
      )
      .limit(1)

    if (!dentist || dentist.role !== "dentist") {
      throw new AppError(404, "APPOINTMENT_DENTIST_NOT_FOUND", "Dentist not found")
    }
  }

  const [updatedAppointment] = await db
    .update(appointments)
    .set({
      patientId: nextPatientId,
      dentistUserId: nextDentistUserId,
      startsAt: nextStartsAt,
      endsAt: nextEndsAt,
      title: input.title ?? existingAppointment.title,
      description: input.description === undefined
        ? existingAppointment.description
        : input.description,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(appointments.orgId, input.orgId),
        eq(appointments.id, input.appointmentId),
      ),
    )
    .returning()

  return {
    ...updatedAppointment!,
    startsAt: updatedAppointment!.startsAt.toISOString(),
    endsAt: updatedAppointment!.endsAt.toISOString(),
    createdAt: updatedAppointment!.createdAt.toISOString(),
    updatedAt: updatedAppointment!.updatedAt.toISOString(),
  }
}
