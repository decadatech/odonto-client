import { z } from "zod"

const appointmentPatientSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
})

const appointmentDentistSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
})

export const appointmentSchema = z.object({
  id: z.uuid(),
  orgId: z.string().min(1),
  patientId: z.uuid(),
  dentistUserId: z.uuid(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  title: z.string().min(1),
  description: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const appointmentWithRelationsSchema = appointmentSchema.extend({
  patient: appointmentPatientSchema,
  dentist: appointmentDentistSchema,
})

export const listAppointmentsResponseSchema = z.array(appointmentWithRelationsSchema)

export const createAppointmentPayloadSchema = z.object({
  patientId: z.uuid(),
  dentistUserId: z.uuid(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).nullable().optional(),
})

export const updateAppointmentPayloadSchema = createAppointmentPayloadSchema
  .partial()
  .refine(
    (payload) => Object.values(payload).some((value) => value !== undefined),
    {
      message: "At least one field must be provided",
    },
  )
