import { beforeEach, describe, expect, it, vi } from "vitest"

import { createPatientUseCase, type CreatePatientUseCaseInput } from "."

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

describe("createPatientUseCase", () => {
  const input: CreatePatientUseCaseInput = {
    orgId: "org_123",
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

  it("should throw when a patient with same CPF already exists", async () => {
    selectLimitMock.mockResolvedValueOnce([{ id: "patient_1" }])

    await expect(createPatientUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 409,
        code: "PATIENT_CPF_ALREADY_EXISTS",
      }),
    )

    expect(insertMock).not.toHaveBeenCalled()
  })

  it("should throw when a patient with same RG already exists", async () => {
    selectLimitMock.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "patient_2" }])

    await expect(createPatientUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 409,
        code: "PATIENT_RG_ALREADY_EXISTS",
      }),
    )

    expect(insertMock).not.toHaveBeenCalled()
  })

  it("should create and return patient output when CPF and RG are unique", async () => {
    const now = new Date("2026-03-05T12:00:00.000Z")

    selectLimitMock.mockResolvedValueOnce([]).mockResolvedValueOnce([])
    insertReturningMock.mockResolvedValueOnce([
      {
        id: "patient_3",
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

    const output = await createPatientUseCase(input)

    expect(insertMock).toHaveBeenCalledOnce()
    expect(insertValuesMock).toHaveBeenCalledWith({
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
    })
    expect(output.createdAt).toBe("2026-03-05T12:00:00.000Z")
    expect(output.updatedAt).toBe("2026-03-05T12:00:00.000Z")
  })
})
