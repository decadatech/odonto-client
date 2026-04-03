"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { listAppointmentsAction } from "@/app/actions/appointments"
import { listAppointmentsResponseSchema } from "@/schemas/appointments"

type ListAppointmentsResponse = z.infer<typeof listAppointmentsResponseSchema>

type UseAppointmentsQueryOptions = {
  patientIds?: string[]
  dentistUserIds?: string[]
}

type UseAppointmentsReactQueryOptions = Omit<
  UseQueryOptions<ListAppointmentsResponse>,
  "queryKey" | "queryFn" | "initialData"
>

export function getAppointmentsQueryKey({
  patientIds,
  dentistUserIds,
}: UseAppointmentsQueryOptions = {}) {
  return [
    "appointments",
    {
      patientIds: patientIds ?? [],
      dentistUserIds: dentistUserIds ?? [],
    },
  ] as const
}

export function useAppointmentsQuery(
  initialData?: ListAppointmentsResponse,
  {
    patientIds,
    dentistUserIds,
  }: UseAppointmentsQueryOptions = {},
  options?: UseAppointmentsReactQueryOptions,
) {
  return useQuery({
    queryKey: getAppointmentsQueryKey({ patientIds, dentistUserIds }),
    queryFn: () => listAppointmentsAction({ patientIds, dentistUserIds }),
    initialData,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    ...options,
  })
}
