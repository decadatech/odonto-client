import { z } from "zod"

const rgMaskRegex = /^\d{2}\.\d{3}\.\d{3}-\d$/
const cpfMaskRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const phoneMaskRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/
const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/

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

export const patientFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(240, "Nome deve ter no máximo 240 caracteres."),
  sex: z
    .enum(["male", "female", "other"])
    .or(z.literal(""))
    .refine((value) => value !== "", "Sexo é obrigatório"),
  birthDate: z
    .string()
    .trim()
    .min(1, "Data de nascimento é obrigatória")
    .refine((value) => birthDateRegex.test(value), "Data de nascimento inválida"),
  rg: z
    .string()
    .trim()
    .regex(rgMaskRegex, "Preencha o RG completo no formato 99.999.999-9"),
  cpf: z
    .string()
    .trim()
    .regex(cpfMaskRegex, "Preencha o CPF completo no formato 999.999.999-99"),
  phone: z
    .string()
    .trim()
    .regex(phoneMaskRegex, "Preencha o telefone completo no formato (99) 99999-9999"),
  email: z
    .string()
    .max(240, "E-mail deve ter no máximo 240 caracteres.")
    .transform((value) => value.trim().toLowerCase())
    .refine((value) => value === "" || z.email().safeParse(value).success, "E-mail inválido"),
  zipCode: z
    .string()
    .trim()
    .min(1, "CEP é obrigatório")
    .max(25, "CEP deve ter no máximo 25 caracteres.")
    .regex(/^\d+$/, "CEP deve conter apenas números"),
  street: z.string().trim().min(1, "Logradouro é obrigatório").max(240, "Logradouro deve ter no máximo 240 caracteres."),
  streetNumber: z.string().trim().min(1, "Número é obrigatório").max(20, "Número deve ter no máximo 20 caracteres."),
  neighborhood: z.string().trim().min(1, "Bairro é obrigatório").max(240, "Bairro deve ter no máximo 240 caracteres."),
  city: z.string().trim().min(1, "Cidade é obrigatória").max(240, "Cidade deve ter no máximo 240 caracteres."),
  state: z.string().trim().length(2, "UF é obrigatória"),
})

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
