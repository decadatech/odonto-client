import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getPatientByIdUseCase,
  type GetPatientByIdUseCaseInput,
} from "."

const selectWhereMock = vi.hoisted(() => vi.fn())
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: selectFromMock })))

vi.mock("../../db", () => ({
  db: {
    select: selectMock,
  },
}))

describe("getPatientByIdUseCase", () => {
  const input: GetPatientByIdUseCaseInput = {
    orgId: "org_123",
    patientId: "patient_123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw PATIENT_NOT_FOUND when patient does not exist", async () => {
    selectWhereMock.mockResolvedValueOnce([])

    await expect(getPatientByIdUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "PATIENT_NOT_FOUND",
      }),
    )
  })

  it("should return patient when found", async () => {
    const now = new Date("2026-03-07T15:00:00.000Z")

    selectWhereMock.mockResolvedValueOnce([
      {
        id: input.patientId,
        orgId: input.orgId,
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
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await getPatientByIdUseCase(input)

    expect(output).toEqual({
      id: input.patientId,
      orgId: input.orgId,
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
      createdAt: "2026-03-07T15:00:00.000Z",
      updatedAt: "2026-03-07T15:00:00.000Z",
    })
  })
})
