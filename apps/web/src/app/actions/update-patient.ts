"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { backendErrorSchema } from "@/schemas/api"
import { patientPayloadSchema } from "@/schemas/patients"

type UpdatePatientFormState = {
  code?: string
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

export async function updatePatientAction(
  patientId: string,
  _state: UpdatePatientFormState,
  formData: FormData,
): Promise<UpdatePatientFormState> {
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
  redirect("/patients")
}
