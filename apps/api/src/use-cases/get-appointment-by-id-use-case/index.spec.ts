import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getAppointmentByIdUseCase,
  type GetAppointmentByIdUseCaseInput,
} from "."

const selectLimitMock = vi.hoisted(() => vi.fn())
const selectWhereMock = vi.hoisted(() => vi.fn(() => ({ limit: selectLimitMock })))
const selectInnerJoinSecondMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
const selectInnerJoinFirstMock = vi.hoisted(() => vi.fn(() => ({ innerJoin: selectInnerJoinSecondMock })))
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ innerJoin: selectInnerJoinFirstMock })))
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: selectFromMock })))

vi.mock("../../db", () => ({
  db: {
    select: selectMock,
  },
}))

describe("getAppointmentByIdUseCase", () => {
  const input: GetAppointmentByIdUseCaseInput = {
    orgId: "org_123",
    appointmentId: "appointment_123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw APPOINTMENT_NOT_FOUND when appointment does not exist", async () => {
    selectLimitMock.mockResolvedValueOnce([])

    await expect(getAppointmentByIdUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "APPOINTMENT_NOT_FOUND",
      }),
    )
  })

  it("should return appointment when found", async () => {
    const now = new Date("2026-03-13T09:00:00.000Z")

    selectLimitMock.mockResolvedValueOnce([
      {
        appointment: {
          id: input.appointmentId,
          orgId: input.orgId,
          patientId: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
          dentistUserId: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
          startsAt: new Date("2026-03-13T10:00:00.000Z"),
          endsAt: new Date("2026-03-13T11:00:00.000Z"),
          title: "Consulta de rotina",
          description: "Retorno semestral",
          createdAt: now,
          updatedAt: now,
        },
        patient: {
          id: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
          name: "Maria Silva",
        },
        dentist: {
          id: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
          name: "Dra. Ana",
        },
      },
    ])

    const output = await getAppointmentByIdUseCase(input)

    expect(output).toEqual({
      id: input.appointmentId,
      orgId: input.orgId,
      patientId: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
      dentistUserId: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
      startsAt: "2026-03-13T10:00:00.000Z",
      endsAt: "2026-03-13T11:00:00.000Z",
      title: "Consulta de rotina",
      description: "Retorno semestral",
      patient: {
        id: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
        name: "Maria Silva",
      },
      dentist: {
        id: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
        name: "Dra. Ana",
      },
      createdAt: "2026-03-13T09:00:00.000Z",
      updatedAt: "2026-03-13T09:00:00.000Z",
    })
  })
})
