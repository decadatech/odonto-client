import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createAppointmentUseCase,
  type CreateAppointmentUseCaseInput,
} from "."

const selectLimitMock = vi.hoisted(() => vi.fn())
const selectWhereMock = vi.hoisted(() => vi.fn(() => ({ limit: selectLimitMock })))
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: selectFromMock })))

const insertReturningMock = vi.hoisted(() => vi.fn())
const insertValuesMock = vi.hoisted(() => vi.fn(() => ({ returning: insertReturningMock })))
const insertMock = vi.hoisted(() => vi.fn(() => ({ values: insertValuesMock })))

vi.mock("../../db", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
  },
}))

describe("createAppointmentUseCase", () => {
  const input: CreateAppointmentUseCaseInput = {
    orgId: "org_123",
    patientId: "patient_123",
    dentistUserId: "dentist_123",
    startsAt: "2026-03-13T10:00:00.000Z",
    endsAt: "2026-03-13T11:00:00.000Z",
    title: "Consulta de rotina",
    description: "Retorno semestral",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw when patient does not exist", async () => {
    selectLimitMock.mockResolvedValueOnce([])

    await expect(createAppointmentUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "APPOINTMENT_PATIENT_NOT_FOUND",
      }),
    )

    expect(insertMock).not.toHaveBeenCalled()
  })

  it("should throw when dentist does not exist or is not a dentist", async () => {
    selectLimitMock
      .mockResolvedValueOnce([{ id: input.patientId }])
      .mockResolvedValueOnce([{ id: input.dentistUserId, role: "secretary" }])

    await expect(createAppointmentUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "APPOINTMENT_DENTIST_NOT_FOUND",
      }),
    )

    expect(insertMock).not.toHaveBeenCalled()
  })

  it("should create and return appointment output", async () => {
    const now = new Date("2026-03-13T09:00:00.000Z")

    selectLimitMock
      .mockResolvedValueOnce([{ id: input.patientId }])
      .mockResolvedValueOnce([{ id: input.dentistUserId, role: "dentist" }])

    insertReturningMock.mockResolvedValueOnce([
      {
        id: "appointment_123",
        orgId: input.orgId,
        patientId: input.patientId,
        dentistUserId: input.dentistUserId,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        title: input.title,
        description: input.description,
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await createAppointmentUseCase(input)

    expect(insertMock).toHaveBeenCalledOnce()
    expect(insertValuesMock).toHaveBeenCalledWith({
      orgId: input.orgId,
      patientId: input.patientId,
      dentistUserId: input.dentistUserId,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      title: input.title,
      description: input.description,
    })
    expect(output).toEqual({
      id: "appointment_123",
      orgId: input.orgId,
      patientId: input.patientId,
      dentistUserId: input.dentistUserId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      title: input.title,
      description: input.description,
      createdAt: "2026-03-13T09:00:00.000Z",
      updatedAt: "2026-03-13T09:00:00.000Z",
    })
  })
})
