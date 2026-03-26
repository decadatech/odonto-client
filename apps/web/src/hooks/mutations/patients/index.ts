"use client"

import { useMutation } from "@tanstack/react-query"
import { z } from "zod"

import { createPatientAction, updatePatientAction } from "@/app/actions/patients"
import { patientFormSchema } from "@/schemas/patients"

type PatientMutationInput = z.input<typeof patientFormSchema>

type UsePatientMutationParams =
  | {
    mode: "create"
  }
  | {
    mode: "update"
    patientId: string
  }

export class PatientMutationError extends Error {
  code: string

  constructor(code: string) {
    super(code)
    this.name = "PatientMutationError"
    this.code = code
  }
}

export function isPatientMutationError(error: unknown): error is PatientMutationError {
  return error instanceof PatientMutationError
}

export function usePatientMutation(params: UsePatientMutationParams) {
  return useMutation<void, Error, PatientMutationInput>({
    mutationFn: async (input) => {
      const result = params.mode === "create"
        ? await createPatientAction(input)
        : await updatePatientAction(params.patientId, input)

      if (result.code) {
        throw new PatientMutationError(result.code)
      }
    },
  })
}
