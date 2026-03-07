import { beforeEach, describe, expect, it, vi } from "vitest"

import { updatePatientUseCase, type UpdatePatientUseCaseInput } from "."

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

describe("updatePatientUseCase", () => {
  const input: UpdatePatientUseCaseInput = {
    orgId: "org_123",
    patientId: "patient_123",
    name: "Maria Silva",
    sex: "female",
    birthDate: "1990-10-10",
    rg: "123456789",
    cpf: "12345678901",
    phone: "11999998888",
    email: "maria@example.com",
    zipCode: "01310100",
    street: "Rua A",
    streetNumber: "100",
    neighborhood: "Centro",
    city: "Sao Paulo",
    state: "SP",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw when patient does not exist", async () => {
    selectLimitMock.mockResolvedValueOnce([])

    await expect(updatePatientUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "PATIENT_NOT_FOUND",
      }),
    )

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("should throw when a different patient with same CPF already exists", async () => {
    selectLimitMock.mockResolvedValueOnce([{ id: input.patientId }]).mockResolvedValueOnce([{ id: "patient_2" }])

    await expect(updatePatientUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 409,
        code: "PATIENT_CPF_ALREADY_EXISTS",
      }),
    )

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("should throw when a different patient with same RG already exists", async () => {
    selectLimitMock
      .mockResolvedValueOnce([{ id: input.patientId }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "patient_3" }])

    await expect(updatePatientUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 409,
        code: "PATIENT_RG_ALREADY_EXISTS",
      }),
    )

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("should update and return patient output when CPF and RG are unique", async () => {
    const now = new Date("2026-03-07T13:00:00.000Z")

    selectLimitMock
      .mockResolvedValueOnce([{ id: input.patientId }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    updateReturningMock.mockResolvedValueOnce([
      {
        id: input.patientId,
        orgId: input.orgId,
        name: input.name,
        sex: input.sex,
        birthDate: input.birthDate,
        rg: input.rg,
        cpf: input.cpf,
        phone: input.phone,
        email: input.email,
        zipCode: input.zipCode,
        street: input.street,
        streetNumber: input.streetNumber,
        neighborhood: input.neighborhood,
        city: input.city,
        state: input.state,
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await updatePatientUseCase(input)

    expect(updateMock).toHaveBeenCalledOnce()
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: input.name,
        sex: input.sex,
        birthDate: input.birthDate,
        rg: input.rg,
        cpf: input.cpf,
        phone: input.phone,
        email: input.email,
        zipCode: input.zipCode,
        street: input.street,
        streetNumber: input.streetNumber,
        neighborhood: input.neighborhood,
        city: input.city,
        state: input.state,
        updatedAt: expect.any(Date),
      }),
    )
    expect(output.createdAt).toBe("2026-03-07T13:00:00.000Z")
    expect(output.updatedAt).toBe("2026-03-07T13:00:00.000Z")
  })
})
