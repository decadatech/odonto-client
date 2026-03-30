import { z } from "zod"

import { sortOrderSchema } from "./commons"

const getPatientResponseSchema = z.object({
  id: z.uuid(),
  orgId: z.string().min(1),
  name: z.string().min(1),
  sex: z.enum(["male", "female", "other"]),
  birthDate: z.string(),
  rg: z.string().min(1),
  cpf: z.string().min(11),
  phone: z.string().min(8),
  email: z.email().nullable(),
  zipCode: z.string().min(1),
  street: z.string().min(1),
  streetNumber: z.string().min(1),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const getPatientByIdParamsSchema = z.object({
  patient_id: z.uuid(),
})

export const getPatientByIdResponseSchema = getPatientResponseSchema

export const createPatientBodySchema = z.object({
  name: z.string().min(1).trim(),
  sex: z.enum(["male", "female", "other"]),
  birthDate: z.string().date().trim(),
  rg: z.string().min(1).trim(),
  cpf: z.string().min(11).trim(),
  phone: z.string().min(8).trim(),
  email: z.string().trim().toLowerCase().email().optional().nullable(),
  zipCode: z.string().min(1).trim(),
  street: z.string().min(1).trim(),
  streetNumber: z.string().min(1).trim(),
  neighborhood: z.string().min(1).trim(),
  city: z.string().min(1).trim(),
  state: z.string().trim().toUpperCase(),
})

export const createPatientResponseSchema = getPatientResponseSchema

export const updatePatientParamsSchema = z.object({
  patient_id: z.uuid(),
})

export const updatePatientBodySchema = createPatientBodySchema

export const updatePatientResponseSchema = getPatientResponseSchema

export const listPatientsSortBySchema = z.enum(["name", "created_at", "updated_at"])

export const listPatientsQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sort_by: listPatientsSortBySchema.default("name"),
  sort_order: sortOrderSchema.default("asc"),
})

export const listPatientsResponseSchema = z.object({
  items: z.array(getPatientResponseSchema),
  nextCursor: z.string().nullable(),
})
