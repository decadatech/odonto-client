"use server"

import { revalidatePath, updateTag } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

import { backendErrorSchema } from "@/schemas/api"
import {
  listPatientsResponseSchema,
  patientFormSchema,
  patientPayloadSchema,
  patientSchema,
} from "@/schemas/patients"
import type { Pagination, SortOrder } from "@/types/api"
import { onlyDigits } from "@/utils/parsers"

const PATIENTS_CACHE_TAG = "patients"

type ListPatientsInput = {
  cursor?: string
  limit?: number
  search?: string
  sortBy?: Pagination["sort_by"]
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

export async function listPatientsAction({
  cursor,
  limit = 20,
  search,
  sortBy = "name",
  sortOrder = "asc",
}: ListPatientsInput = {}) {
  const headers = await getAuthorizationHeader()
  const normalizedSearch = search?.trim() || undefined
  const params = new URLSearchParams({
    limit: String(limit),
    sort_by: sortBy ?? "name",
    sort_order: sortOrder,
  })

  if (normalizedSearch) {
    params.set("search", normalizedSearch)
  }

  if (cursor) {
    params.set("cursor", cursor)
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    cache: "force-cache",
    next: {
      tags: [PATIENTS_CACHE_TAG],
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch patients")
  }

  const responseData = await response.json()
  return listPatientsResponseSchema.parse(responseData)
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

  updateTag(PATIENTS_CACHE_TAG)
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

  updateTag(PATIENTS_CACHE_TAG)
  revalidatePath("/patients")
  return {}
}
