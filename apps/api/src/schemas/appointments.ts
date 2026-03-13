import { z } from "zod"

const appointmentPatientSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
})

const appointmentDentistSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
})

const appointmentResponseSchema = z.object({
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

export const getAppointmentByIdParamsSchema = z.object({
  appointment_id: z.uuid(),
})

export const getAppointmentByIdResponseSchema = appointmentResponseSchema.extend({
  patient: appointmentPatientSchema,
  dentist: appointmentDentistSchema,
})

export const listAppointmentsResponseSchema = z.array(getAppointmentByIdResponseSchema)

export const createAppointmentBodySchema = z
  .object({
    patientId: z.uuid(),
    dentistUserId: z.uuid(),
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).nullable().optional(),
  })
  .refine((body) => new Date(body.endsAt).getTime() > new Date(body.startsAt).getTime(), {
    message: "End date must be greater than start date",
    path: ["endsAt"],
  })

export const createAppointmentResponseSchema = appointmentResponseSchema

export const updateAppointmentParamsSchema = z.object({
  appointment_id: z.uuid(),
})

export const updateAppointmentBodySchema = createAppointmentBodySchema
  .partial()
  .refine(
    (body) => Object.values(body).some((value) => value !== undefined),
    {
      message: "At least one field must be provided",
    },
  )
  .refine((body) => {
    if (!body.startsAt || !body.endsAt) {
      return true
    }

    return new Date(body.endsAt).getTime() > new Date(body.startsAt).getTime()
  }, {
    message: "End date must be greater than start date",
    path: ["endsAt"],
  })

export const updateAppointmentResponseSchema = appointmentResponseSchema
