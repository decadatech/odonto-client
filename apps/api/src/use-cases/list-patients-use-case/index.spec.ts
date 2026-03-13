import { beforeEach, describe, expect, it, vi } from "vitest"

import { listPatientsUseCase, type ListPatientsUseCaseInput } from "."

const selectWhereMock = vi.hoisted(() => vi.fn())
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: selectFromMock })))

vi.mock("../../db", () => ({
  db: {
    select: selectMock,
  },
}))

describe("listPatientsUseCase", () => {
  const input: ListPatientsUseCaseInput = {
    orgId: "org_123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should list patients from the organization", async () => {
    const now = new Date("2026-03-08T12:00:00.000Z")

    selectWhereMock.mockResolvedValueOnce([
      {
        id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
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
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await listPatientsUseCase(input)

    expect(output).toEqual([
      {
        id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
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
        createdAt: "2026-03-08T12:00:00.000Z",
        updatedAt: "2026-03-08T12:00:00.000Z",
      },
    ])
  })

  it("should return an empty array when no patients are found", async () => {
    selectWhereMock.mockResolvedValueOnce([])

    const output = await listPatientsUseCase(input)

    expect(output).toEqual([])
  })
})
