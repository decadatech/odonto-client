import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { appointments, patients, users } from "../../db/schema"
import { AppError } from "../../http/errors/app-error"
import { getAppointmentByIdResponseSchema } from "../../schemas/appointments"

export type GetAppointmentByIdUseCaseInput = {
  orgId: string
  appointmentId: string
}

export type GetAppointmentByIdUseCaseOutput = z.infer<typeof getAppointmentByIdResponseSchema>

export async function getAppointmentByIdUseCase(
  input: GetAppointmentByIdUseCaseInput,
): Promise<GetAppointmentByIdUseCaseOutput> {
  const [appointment] = await db
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
      and(
        eq(appointments.patientId, patients.id),
        eq(appointments.orgId, patients.orgId),
      ),
    )
    .innerJoin(
      users,
      and(
        eq(appointments.dentistUserId, users.id),
        eq(appointments.orgId, users.orgId),
      ),
    )
    .where(
      and(
        eq(appointments.orgId, input.orgId),
        eq(appointments.id, input.appointmentId),
      ),
    )
    .limit(1)

  if (!appointment) {
    throw new AppError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found")
  }

  return {
    ...appointment.appointment,
    patient: appointment.patient,
    dentist: appointment.dentist,
    startsAt: appointment.appointment.startsAt.toISOString(),
    endsAt: appointment.appointment.endsAt.toISOString(),
    createdAt: appointment.appointment.createdAt.toISOString(),
    updatedAt: appointment.appointment.updatedAt.toISOString(),
  }
}
