"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

import { backendErrorSchema } from "@/schemas/api"
import {
  appointmentSchema,
  listAppointmentsResponseSchema,
  createAppointmentPayloadSchema,
  updateAppointmentPayloadSchema,
} from "@/schemas/appointments"

type ListAppointmentsResponse = z.infer<typeof listAppointmentsResponseSchema>

// TODO: time frame filter
export async function listAppointmentsAction(): Promise<ListAppointmentsResponse> {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    throw new Error("Unauthenticated request")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch appointments")
  }

  const responseData = await response.json()
  const appointments = listAppointmentsResponseSchema.parse(responseData)

  return appointments
}

type PostAppointmentActionResponse = {
  code?: string
  appointment?: z.infer<typeof appointmentSchema>
}

export async function createAppointmentAction(
  _state: PostAppointmentActionResponse,
  formData: FormData,
): Promise<PostAppointmentActionResponse> {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    return { code: "UNAUTHENTICATED" }
  }

  const payload = createAppointmentPayloadSchema.safeParse({
    patientId: String(formData.get("patientId") ?? ""),
    dentistUserId: String(formData.get("dentistUserId") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "").trim() || null,
  })

  if (!payload.success) {
    return { code: "INVALID_FORM_DATA" }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, {
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

    return { code: "CREATE_APPOINTMENT_FAILED" }
  }

  const responseData = await response.json()
  const appointment = appointmentSchema.parse(responseData)

  revalidatePath("/")

  return { appointment }
}

export async function updateAppointmentAction(
  appointmentId: string,
  _state: PostAppointmentActionResponse,
  formData: FormData,
): Promise<PostAppointmentActionResponse> {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    return { code: "UNAUTHENTICATED" }
  }

  const payload = updateAppointmentPayloadSchema.safeParse({
    patientId: formData.get("patientId") ? String(formData.get("patientId")) : undefined,
    dentistUserId: formData.get("dentistUserId") ? String(formData.get("dentistUserId")) : undefined,
    startsAt: formData.get("startsAt") ? String(formData.get("startsAt")) : undefined,
    endsAt: formData.get("endsAt") ? String(formData.get("endsAt")) : undefined,
    title: formData.get("title") ? String(formData.get("title")) : undefined,
    description: formData.get("description")
      ? String(formData.get("description")).trim() || null
      : undefined,
  })

  if (!payload.success) {
    return { code: "INVALID_FORM_DATA" }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${appointmentId}`, {
    method: "PATCH",
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

    return { code: "UPDATE_APPOINTMENT_FAILED" }
  }

  const responseData = await response.json()
  const appointment = appointmentSchema.parse(responseData)

  revalidatePath("/")

  return { appointment }
}
