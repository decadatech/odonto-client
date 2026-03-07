import { and, eq, ne } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { patients } from "../../db/schema"
import { AppError } from "../../http/errors/app-error"
import { updatePatientResponseSchema } from "../../schemas/patients"

type PatientSex = "male" | "female" | "other"

export type UpdatePatientUseCaseInput = {
  orgId: string
  patientId: string
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

export type UpdatePatientUseCaseOutput = z.infer<typeof updatePatientResponseSchema>

export async function updatePatientUseCase(
  input: UpdatePatientUseCaseInput,
): Promise<UpdatePatientUseCaseOutput> {
  const [existingPatient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, input.orgId),
        eq(patients.id, input.patientId),
      ),
    )
    .limit(1)

  if (!existingPatient) {
    throw new AppError(404, "PATIENT_NOT_FOUND", "Patient not found")
  }

  const [existingPatientByCpf] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, input.orgId),
        eq(patients.cpf, input.cpf),
        ne(patients.id, input.patientId),
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
        ne(patients.id, input.patientId),
      ),
    )
    .limit(1)

  if (existingPatientByRg) {
    throw new AppError(409, "PATIENT_RG_ALREADY_EXISTS", "A patient with this RG already exists")
  }

  const [patient] = await db
    .update(patients)
    .set({
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
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(patients.orgId, input.orgId),
        eq(patients.id, input.patientId),
      ),
    )
    .returning()

  const updatedPatient = patient!

  return {
    ...updatedPatient,
    createdAt: updatedPatient.createdAt.toISOString(),
    updatedAt: updatedPatient.updatedAt.toISOString(),
  }
}
