"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

import { backendErrorSchema } from "@/schemas/api"
import {
  listPatientsResponseSchema,
  patientFormSchema,
  patientPayloadSchema,
  patientSchema,
} from "@/schemas/patients"
import type { Patient } from "@/types/patient"
import { onlyDigits } from "@/utils/parsers"

type SortOrder = "asc" | "desc"

type ListPatientsInput = {
  search?: string
  sortOrder?: SortOrder
}

async function getAuthorizationHeader() {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    throw new Error("Unauthenticated request")
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

function normalizeSortOrder(sortOrder?: string): SortOrder {
  return sortOrder === "desc" ? "desc" : "asc"
}

function mapApiPatientToPatient(apiPatient: ReturnType<typeof patientSchema.parse>): Patient {
  return {
    id: apiPatient.id,
    nome: apiPatient.name,
    rg: apiPatient.rg,
    telefone: apiPatient.phone,
    email: apiPatient.email ?? "-",
  }
}

// REVIEW: simplify method
export async function listPatientsAction({ search, sortOrder }: ListPatientsInput = {}) {
  const headers = await getAuthorizationHeader()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch patients")
  }

  const responseData = await response.json()
  const apiPatients = listPatientsResponseSchema.parse(responseData)

  const mappedPatients = apiPatients.map(mapApiPatientToPatient)

  const filteredPatients = mappedPatients.filter((patient) =>
    patient.nome.toLowerCase().includes((search ?? "").toLowerCase()),
  )

  const normalizedSortOrder = normalizeSortOrder(sortOrder)

  filteredPatients.sort((a, b) => {
    if (normalizedSortOrder === "asc") {
      return a.nome.localeCompare(b.nome)
    }

    return b.nome.localeCompare(a.nome)
  })

  return filteredPatients
}

type GetPatientByIdResponse = z.infer<typeof patientSchema> | null

export async function getPatientByIdAction(
  patientId: string,
): Promise<GetPatientByIdResponse> {
  const headers = await getAuthorizationHeader()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${patientId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Failed to fetch patient")
  }

  const responseData = await response.json()
  return patientSchema.parse(responseData)
}

type CreatePatientActionInput = z.input<typeof patientFormSchema>

type CreatePatientActionResult = {
  code?: string
}

export async function createPatientAction(
  input: CreatePatientActionInput,
): Promise<CreatePatientActionResult> {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    return {
      code: "UNAUTHENTICATED",
    }
  }

  const parsedInput = patientFormSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      code: "INVALID_FORM_DATA",
    }
  }

  const payload = patientPayloadSchema.safeParse({
    ...parsedInput.data,
    cpf: onlyDigits(parsedInput.data.cpf),
    phone: onlyDigits(parsedInput.data.phone),
    email: parsedInput.data.email || null,
    zipCode: onlyDigits(parsedInput.data.zipCode),
    state: parsedInput.data.state.toUpperCase(),
  })

  if (!payload.success) {
    return {
      code: "INVALID_FORM_DATA",
    }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload.data),
  })

  if (!response.ok) {
    const responseData = await response.json().catch(() => null)
    const parsedError = backendErrorSchema.safeParse(responseData)

    const errorBody = await response.text().catch(() => "<unreadable body>")
    console.error("[createPatientAction] Request failed", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      body: errorBody,
    })

    if (parsedError.success) {
      return {
        code: parsedError.data.code,
      }
    }

    return {
      code: "CREATE_PATIENT_FAILED",
    }
  }

  revalidatePath("/patients")
  return {}
}

type UpdatePatientActionInput = z.input<typeof patientFormSchema>

type UpdatePatientActionResult = {
  code?: string
}

export async function updatePatientAction(
  patientId: string,
  input: UpdatePatientActionInput,
): Promise<UpdatePatientActionResult> {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    return {
      code: "UNAUTHENTICATED",
    }
  }

  const parsedInput = patientFormSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      code: "INVALID_FORM_DATA",
    }
  }

  const payload = patientPayloadSchema.safeParse({
    ...parsedInput.data,
    cpf: onlyDigits(parsedInput.data.cpf),
    phone: onlyDigits(parsedInput.data.phone),
    email: parsedInput.data.email || null,
    zipCode: onlyDigits(parsedInput.data.zipCode),
    state: parsedInput.data.state.toUpperCase(),
  })

  if (!payload.success) {
    return {
      code: "INVALID_FORM_DATA",
    }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${patientId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload.data),
  })

  if (!response.ok) {
    const responseData = await response.json().catch(() => null)
    const parsedError = backendErrorSchema.safeParse(responseData)

    if (parsedError.success) {
      return {
        code: parsedError.data.code,
      }
    }

    return {
      code: "UPDATE_PATIENT_FAILED",
    }
  }

  revalidatePath("/patients")
  return {}
}
