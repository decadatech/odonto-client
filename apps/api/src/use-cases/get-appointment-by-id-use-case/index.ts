import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { appointments } from "../../db/schema"
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
    .select()
    .from(appointments)
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
    ...appointment,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  }
}
