import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { patients } from "../../db/schema"
import { listPatientsResponseSchema } from "../../schemas/patients"

export type ListPatientsUseCaseInput = {
  orgId: string
}

type ListPatientsResponse = z.infer<typeof listPatientsResponseSchema>

export type ListPatientsUseCaseOutput = ListPatientsResponse

function toPatientOutput(patient: typeof patients.$inferSelect): ListPatientsResponse[number] {
  return {
    ...patient,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  }
}

export async function listPatientsUseCase(
  input: ListPatientsUseCaseInput,
): Promise<ListPatientsUseCaseOutput> {
  const result = await db
    .select()
    .from(patients)
    .where(eq(patients.orgId, input.orgId))

  return result.map(toPatientOutput)
}
