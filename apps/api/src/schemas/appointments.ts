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

function normalizeUuidListFilter(value: string | string[] | undefined) {
  if (!value) {
    return undefined
  }

  const rawValues = Array.isArray(value) ? value : [value]

  const ids = rawValues
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean)

  if (ids.length === 0) {
    return undefined
  }

  return [...new Set(ids.map((id) => z.uuid().parse(id)))]
}

export const getAppointmentByIdParamsSchema = z.object({
  appointment_id: z.uuid(),
})

export const getAppointmentByIdResponseSchema = appointmentResponseSchema.extend({
  patient: appointmentPatientSchema,
  dentist: appointmentDentistSchema,
})

export const listAppointmentsQuerySchema = z.object({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  patient_ids: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform(normalizeUuidListFilter),
  dentist_user_ids: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform(normalizeUuidListFilter),
})
  .refine((query) => {
    if (!query.from && !query.to) {
      return true
    }

    return Boolean(query.from && query.to)
  }, {
    message: "from and to must be provided together",
    path: ["to"],
  })
  .refine((query) => {
    if (!query.from || !query.to) {
      return true
    }

    return new Date(query.to).getTime() > new Date(query.from).getTime()
  }, {
    message: "to must be greater than from",
    path: ["to"],
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
