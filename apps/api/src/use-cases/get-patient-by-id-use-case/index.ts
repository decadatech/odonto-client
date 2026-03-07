import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { patients } from "../../db/schema"
import { getPatientByIdResponseSchema } from "../../schemas/patients"
import { AppError } from "../../http/errors/app-error"

export type GetPatientByIdUseCaseInput = {
  orgId: string
  patientId: string
}

export type GetPatientByIdUseCaseOutput = z.infer<typeof getPatientByIdResponseSchema>

export async function getPatientByIdUseCase(
  input: GetPatientByIdUseCaseInput,
): Promise<GetPatientByIdUseCaseOutput> {
  const [patient] = await db
    .select()
    .from(patients)
    .where(
      and(
        eq(patients.orgId, input.orgId),
        eq(patients.id, input.patientId),
      ),
    )

  if (!patient) {
    throw new AppError(404, "PATIENT_NOT_FOUND", "Patient not found")
  }

  return {
    ...patient,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  }
}
