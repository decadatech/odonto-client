"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { backendErrorSchema } from "@/schemas/api"
import { createDomainUserPayloadSchema, domainUserSchema } from "@/schemas/users"

type GetCurrentDomainUserResult =
  | { exists: true; user: ReturnType<typeof domainUserSchema.parse> }
  | { exists: false }

type CreateCurrentDomainUserState = {
  code?: string
}

export async function getCurrentDomainUserAction(): Promise<GetCurrentDomainUserResult> {
  const { userId, getToken } = await auth()

  if (!userId) {
    return { exists: false }
  }

  const token = await getToken()

  if (!token) {
    return { exists: false }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/external_id/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (response.status === 404) {
    const responseData = await response.json().catch(() => null)
    const parsedError = backendErrorSchema.safeParse(responseData)

    if (parsedError.success && parsedError.data.code === "USER_NOT_FOUND") {
      return { exists: false }
    }
  }

  if (!response.ok) {
    throw new Error("Failed to fetch domain user")
  }

  const responseData = await response.json()
  const user = domainUserSchema.parse(responseData)

  return {
    exists: true,
    user,
  }
}

export async function createCurrentDomainUserAction(
  _state: CreateCurrentDomainUserState,
  formData: FormData,
): Promise<CreateCurrentDomainUserState> {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    return { code: "UNAUTHENTICATED" }
  }

  const payload = createDomainUserPayloadSchema.safeParse({
    role: String(formData.get("role") ?? ""),
    cro: String(formData.get("cro") ?? "").trim() || null,
  })

  if (!payload.success) {
    return { code: "INVALID_FORM_DATA" }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
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
      return { code: parsedError.data.code }
    }

    return { code: "COMPLETE_PROFILE_FAILED" }
  }

  redirect("/")
}
