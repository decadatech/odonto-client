import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { patients } from "../../db/schema"
import { AppError } from "../../http/errors/app-error"
import { createPatientResponseSchema } from "../../schemas/patients"

type PatientSex = "male" | "female" | "other"

export type CreatePatientUseCaseInput = {
  orgId: string
  name: string
  sex: PatientSex
  birthDate: string
  rg: string
  cpf: string
  phone: string
  email?: string | null
  zipCode: string
  street: string
  streetNumber: string
  neighborhood: string
  city: string
  state: string
}

export type CreatePatientUseCaseOutput = z.infer<typeof createPatientResponseSchema>

export async function createPatientUseCase(
  input: CreatePatientUseCaseInput,
): Promise<CreatePatientUseCaseOutput> {
  const [existingPatientByCpf] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, input.orgId),
        eq(patients.cpf, input.cpf),
      ),
    )
    .limit(1)

  if (existingPatientByCpf) {
    throw new AppError(409, "PATIENT_CPF_ALREADY_EXISTS", "A patient with this CPF already exists")
  }

  const [existingPatientByRg] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, input.orgId),
        eq(patients.rg, input.rg),
      ),
    )
    .limit(1)

  if (existingPatientByRg) {
    throw new AppError(409, "PATIENT_RG_ALREADY_EXISTS", "A patient with this RG already exists")
  }

  const [patient] = await db
    .insert(patients)
    .values({
      orgId: input.orgId,
      name: input.name,
      sex: input.sex,
      birthDate: input.birthDate,
      rg: input.rg,
      cpf: input.cpf,
      phone: input.phone,
      email: input.email,
      zipCode: input.zipCode,
      street: input.street,
      streetNumber: input.streetNumber,
      neighborhood: input.neighborhood,
      city: input.city,
      state: input.state,
    })
    .returning()

  return toPatientOutput(patient!)
}

function toPatientOutput(patient: typeof patients.$inferSelect): CreatePatientUseCaseOutput {
  return {
    ...patient,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  }
}