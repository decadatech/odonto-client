"use server"

import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

import {
  listPatientsResponseSchema,
  patientSchema,
} from "@/schemas/patients"
import type { Patient } from "@/types/patient"

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
