"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { listAppointmentsAction } from "@/app/actions/appointments"
import { listAppointmentsResponseSchema } from "@/schemas/appointments"

type ListAppointmentsResponse = z.infer<typeof listAppointmentsResponseSchema>

type UseAppointmentsQueryOptions = {
  from?: string
  to?: string
  patientIds?: string[]
  dentistUserIds?: string[]
}

type UseAppointmentsReactQueryOptions = Omit<
  UseQueryOptions<ListAppointmentsResponse>,
  "queryKey" | "queryFn" | "initialData"
>

export function getAppointmentsQueryKey({
  from,
  to,
  patientIds,
  dentistUserIds,
}: UseAppointmentsQueryOptions = {}) {
  return [
    "appointments",
    {
      from: from ?? null,
      to: to ?? null,
      patientIds: patientIds ?? [],
      dentistUserIds: dentistUserIds ?? [],
    },
  ] as const
}

export function useAppointmentsQuery(
  initialData?: ListAppointmentsResponse,
  {
    from,
    to,
    patientIds,
    dentistUserIds,
  }: UseAppointmentsQueryOptions = {},
  options?: UseAppointmentsReactQueryOptions,
) {
  return useQuery({
    queryKey: getAppointmentsQueryKey({ from, to, patientIds, dentistUserIds }),
    queryFn: () => listAppointmentsAction({ from, to, patientIds, dentistUserIds }),
    initialData,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    ...options,
  })
}
