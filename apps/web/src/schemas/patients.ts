import { z } from "zod"

export const patientSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  sex: z.enum(["male", "female", "other"]),
  birthDate: z.string(),
  rg: z.string().min(1),
  cpf: z.string().min(11),
  phone: z.string().min(8),
  email: z.string().email().nullable(),
  zipCode: z.string().min(1),
  street: z.string().min(1),
  streetNumber: z.string().min(1),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2),
})

export const listPatientsResponseSchema = z.array(patientSchema)

/** Create or update patient payload schema */
export const patientPayloadSchema = z.object({
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
