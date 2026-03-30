import { beforeEach, describe, expect, it, vi } from "vitest"

import { listPatientsUseCase, type ListPatientsUseCaseInput } from "."

const selectLimitMock = vi.hoisted(() => vi.fn())
const selectOrderByMock = vi.hoisted(() => vi.fn(() => ({ limit: selectLimitMock })))
const selectWhereMock = vi.hoisted(() => vi.fn(() => ({ orderBy: selectOrderByMock })))
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
    limit: 2,
    sortBy: "name",
    sortOrder: "asc",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should list patients from the organization", async () => {
    const now = new Date("2026-03-08T12:00:00.000Z")

    selectLimitMock.mockResolvedValueOnce([
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

    expect(output).toEqual({
      items: [
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
      ],
      nextCursor: null,
    })
    expect(selectLimitMock).toHaveBeenCalledWith(3)
  })

  it("should return an empty page when no patients are found", async () => {
    selectLimitMock.mockResolvedValueOnce([])

    const output = await listPatientsUseCase(input)

    expect(output).toEqual({
      items: [],
      nextCursor: null,
    })
  })

  it("should return a next cursor when there are more patients to paginate", async () => {
    const now = new Date("2026-03-08T12:00:00.000Z")

    selectLimitMock.mockResolvedValueOnce([
      {
        id: "11111111-1111-4111-8111-111111111111",
        orgId: "org_123",
        name: "Ana Clara",
        sex: "female",
        birthDate: "1990-10-10",
        rg: "123456789",
        cpf: "12345678901",
        phone: "11999998888",
        email: "ana@example.com",
        zipCode: "01310100",
        street: "Rua A",
        streetNumber: "100",
        neighborhood: "Centro",
        city: "Sao Paulo",
        state: "SP",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        orgId: "org_123",
        name: "Maria Silva",
        sex: "female",
        birthDate: "1990-10-10",
        rg: "123456789",
        cpf: "12345678901",
        phone: "11999998888",
        email: "maria@example.com",
        zipCode: "01310100",
        street: "Rua B",
        streetNumber: "200",
        neighborhood: "Centro",
        city: "Sao Paulo",
        state: "SP",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        orgId: "org_123",
        name: "Paula Souza",
        sex: "female",
        birthDate: "1990-10-10",
        rg: "123456789",
        cpf: "12345678901",
        phone: "11999998888",
        email: "paula@example.com",
        zipCode: "01310100",
        street: "Rua C",
        streetNumber: "300",
        neighborhood: "Centro",
        city: "Sao Paulo",
        state: "SP",
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await listPatientsUseCase(input)
    const decodedCursor = JSON.parse(
      Buffer.from(output.nextCursor ?? "", "base64url").toString("utf-8"),
    )

    expect(output.items).toHaveLength(2)
    expect(output.items.map(patient => patient.name)).toEqual([
      "Ana Clara",
      "Maria Silva",
    ])
    expect(decodedCursor).toEqual({
      id: "22222222-2222-4222-8222-222222222222",
      value: "Maria Silva",
    })
  })

  it("should reject an invalid cursor payload", async () => {
    await expect(listPatientsUseCase({
      ...input,
      cursor: "invalid-cursor",
    })).rejects.toThrow()
  })
})
