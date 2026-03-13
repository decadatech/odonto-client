import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getAppointmentByIdUseCase,
  type GetAppointmentByIdUseCaseInput,
} from "."

const selectLimitMock = vi.hoisted(() => vi.fn())
const selectWhereMock = vi.hoisted(() => vi.fn(() => ({ limit: selectLimitMock })))
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
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
        id: input.appointmentId,
        orgId: input.orgId,
        patientId: "patient_123",
        dentistUserId: "dentist_123",
        startsAt: new Date("2026-03-13T10:00:00.000Z"),
        endsAt: new Date("2026-03-13T11:00:00.000Z"),
        title: "Consulta de rotina",
        description: "Retorno semestral",
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await getAppointmentByIdUseCase(input)

    expect(output).toEqual({
      id: input.appointmentId,
      orgId: input.orgId,
      patientId: "patient_123",
      dentistUserId: "dentist_123",
      startsAt: "2026-03-13T10:00:00.000Z",
      endsAt: "2026-03-13T11:00:00.000Z",
      title: "Consulta de rotina",
      description: "Retorno semestral",
      createdAt: "2026-03-13T09:00:00.000Z",
      updatedAt: "2026-03-13T09:00:00.000Z",
    })
  })
})
