"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { backendErrorSchema } from "@/schemas/api"
import { patientPayloadSchema } from "@/schemas/patients"
import { onlyDigits } from "@/utils/parsers"

type CreatePatientFormState = {
  code?: string
}

export async function createPatientAction(
  _state: CreatePatientFormState,
  formData: FormData,
): Promise<CreatePatientFormState> {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    return {
      code: "UNAUTHENTICATED",
    }
  }

  const payload = patientPayloadSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    sex: String(formData.get("sex") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    rg: String(formData.get("rg") ?? ""),
    cpf: onlyDigits(String(formData.get("cpf") ?? "")),
    phone: onlyDigits(String(formData.get("phone") ?? "")),
    email: String(formData.get("email") ?? "").trim().toLowerCase() || null,
    zipCode: onlyDigits(String(formData.get("zipCode") ?? "")),
    street: String(formData.get("street") ?? ""),
    streetNumber: String(formData.get("streetNumber") ?? ""),
    neighborhood: String(formData.get("neighborhood") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? "").toUpperCase(),
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
  redirect("/patients")
}
