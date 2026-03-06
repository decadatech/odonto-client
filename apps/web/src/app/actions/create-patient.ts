"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

type CreatePatientFormState = {
  code?: string
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

const createPatientPayloadSchema = z.object({
 name: z.string().min(1).trim(),
  sex: z.enum(["male", "female", "other"]),
  birthDate: z.string().date().trim(),
  rg: z.string().min(1).trim(),
  cpf: z.string().min(11).trim(),
  phone: z.string().min(8).trim(),
  email: z.string().trim().toLowerCase().email().optional().nullable(),
  zipCode: z.string().min(8).trim(),
  street: z.string().min(1).trim(),
  streetNumber: z.string().min(1).trim(),
  neighborhood: z.string().min(1).trim(),
  city: z.string().min(1).trim(),
  state: z.string().trim().toUpperCase(),
})

const backendErrorSchema = z.object({
  status: z.number(),
  code: z.string(),
  details: z.unknown(),
})

export async function createPatientAction(
  _state: CreatePatientFormState,
  formData: FormData,
): Promise<CreatePatientFormState> {
  const { getToken } = await auth()
  const token = await getToken()

  const payload = createPatientPayloadSchema.safeParse({
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
