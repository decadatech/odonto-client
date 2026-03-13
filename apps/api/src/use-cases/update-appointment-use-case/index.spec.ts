import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  updateAppointmentUseCase,
  type UpdateAppointmentUseCaseInput,
} from "."

const selectLimitMock = vi.hoisted(() => vi.fn())
const selectWhereMock = vi.hoisted(() => vi.fn(() => ({ limit: selectLimitMock })))
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: selectFromMock })))

const updateReturningMock = vi.hoisted(() => vi.fn())
const updateWhereMock = vi.hoisted(() => vi.fn(() => ({ returning: updateReturningMock })))
const updateSetMock = vi.hoisted(() => vi.fn(() => ({ where: updateWhereMock })))
const updateMock = vi.hoisted(() => vi.fn(() => ({ set: updateSetMock })))

vi.mock("../../db", () => ({
  db: {
    select: selectMock,
    update: updateMock,
  },
}))

describe("updateAppointmentUseCase", () => {
  const input: UpdateAppointmentUseCaseInput = {
    orgId: "org_123",
    appointmentId: "appointment_123",
    patientId: "patient_456",
    dentistUserId: "dentist_456",
    startsAt: "2026-03-13T12:00:00.000Z",
    endsAt: "2026-03-13T13:00:00.000Z",
    title: "Consulta atualizada",
    description: "Ajuste de agenda",
  }

  const existingAppointment = {
    id: input.appointmentId,
    orgId: input.orgId,
    patientId: "patient_123",
    dentistUserId: "dentist_123",
    startsAt: new Date("2026-03-13T10:00:00.000Z"),
    endsAt: new Date("2026-03-13T11:00:00.000Z"),
    title: "Consulta original",
    description: "Descrição original",
    createdAt: new Date("2026-03-13T09:00:00.000Z"),
    updatedAt: new Date("2026-03-13T09:00:00.000Z"),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw when appointment does not exist", async () => {
    selectLimitMock.mockResolvedValueOnce([])

    await expect(updateAppointmentUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "APPOINTMENT_NOT_FOUND",
      }),
    )

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("should throw when resulting time range is invalid", async () => {
    selectLimitMock.mockResolvedValueOnce([existingAppointment])

    await expect(
      updateAppointmentUseCase({
        ...input,
        startsAt: "2026-03-13T14:00:00.000Z",
        endsAt: "2026-03-13T13:00:00.000Z",
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        status: 400,
        code: "APPOINTMENT_INVALID_TIME_RANGE",
      }),
    )

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("should throw when provided patient does not exist", async () => {
    selectLimitMock
      .mockResolvedValueOnce([existingAppointment])
      .mockResolvedValueOnce([])

    await expect(updateAppointmentUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "APPOINTMENT_PATIENT_NOT_FOUND",
      }),
    )

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("should throw when provided dentist does not exist or is not a dentist", async () => {
    selectLimitMock
      .mockResolvedValueOnce([existingAppointment])
      .mockResolvedValueOnce([{ id: input.patientId }])
      .mockResolvedValueOnce([{ id: input.dentistUserId, role: "secretary" }])

    await expect(updateAppointmentUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "APPOINTMENT_DENTIST_NOT_FOUND",
      }),
    )

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("should update and return appointment output", async () => {
    const updatedAt = new Date("2026-03-13T09:30:00.000Z")

    selectLimitMock
      .mockResolvedValueOnce([existingAppointment])
      .mockResolvedValueOnce([{ id: input.patientId }])
      .mockResolvedValueOnce([{ id: input.dentistUserId, role: "dentist" }])

    updateReturningMock.mockResolvedValueOnce([
      {
        ...existingAppointment,
        patientId: input.patientId,
        dentistUserId: input.dentistUserId,
        startsAt: new Date(input.startsAt!),
        endsAt: new Date(input.endsAt!),
        title: input.title,
        description: input.description,
        updatedAt,
      },
    ])

    const output = await updateAppointmentUseCase(input)

    expect(updateMock).toHaveBeenCalledOnce()
    expect(updateSetMock).toHaveBeenCalledWith({
      patientId: input.patientId,
      dentistUserId: input.dentistUserId,
      startsAt: new Date(input.startsAt!),
      endsAt: new Date(input.endsAt!),
      title: input.title,
      description: input.description,
      updatedAt: expect.any(Date),
    })
    expect(output).toEqual({
      id: existingAppointment.id,
      orgId: existingAppointment.orgId,
      patientId: input.patientId,
      dentistUserId: input.dentistUserId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      title: input.title,
      description: input.description,
      createdAt: "2026-03-13T09:00:00.000Z",
      updatedAt: "2026-03-13T09:30:00.000Z",
    })
  })
})
