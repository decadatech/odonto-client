"use server"

import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { z } from "zod"

import { backendErrorSchema } from "@/schemas/api"
import { createDomainUserPayloadSchema, domainUserSchema } from "@/schemas/users"

type GetCurrentDomainUserResponse =
  | { exists: true; user: z.infer<typeof domainUserSchema> }
  | { exists: false }

export async function getCurrentDomainUserAction(): Promise<GetCurrentDomainUserResponse> {
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
    const errorBody = await response.text().catch(() => "<unreadable body>")
    console.error("[getCurrentDomainUserAction] Request failed", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      body: errorBody,
    })
    throw new Error(`Failed to fetch domain user — status: ${response.status}, body: ${errorBody}`)
  }

  const responseData = await response.json()
  const user = domainUserSchema.parse(responseData)

  return {
    exists: true,
    user,
  }
}

type CreateCurrentDomainUserResponse = {
  code?: string
}

export async function createCurrentDomainUserAction(
  _state: CreateCurrentDomainUserResponse,
  formData: FormData,
): Promise<CreateCurrentDomainUserResponse> {
  const { getToken } = await auth()
  const token = await getToken()
  const clerkUser = await currentUser()

  if (!token || !clerkUser) {
    return { code: "UNAUTHENTICATED" }
  }

  const payload = createDomainUserPayloadSchema.safeParse({
    name: clerkUser.fullName?.trim() || clerkUser.firstName?.trim() || "",
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

type ListDentistsResponse = Array<z.infer<typeof domainUserSchema>>

export async function listDentistsAction(): Promise<ListDentistsResponse> {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    throw new Error("Unauthenticated request")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?role=dentist`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch dentists")
  }

  const responseData = await response.json()
  const users = domainUserSchema.array().parse(responseData)

  return users
}
