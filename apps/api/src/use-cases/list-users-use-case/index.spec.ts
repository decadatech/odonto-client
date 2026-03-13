import { beforeEach, describe, expect, it, vi } from "vitest"

import { listUsersUseCase, type ListUsersUseCaseInput } from "."

const selectWhereMock = vi.hoisted(() => vi.fn())
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: selectFromMock })))

vi.mock("../../db", () => ({
  db: {
    select: selectMock,
  },
}))

describe("listUsersUseCase", () => {
  const input: ListUsersUseCaseInput = {
    orgId: "org_123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should list users from the organization", async () => {
    const now = new Date("2026-03-08T12:00:00.000Z")

    selectWhereMock.mockResolvedValueOnce([
      {
        id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
        clerkId: "user_123",
        orgId: "org_123",
        role: "secretary",
        cro: null,
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await listUsersUseCase(input)

    expect(output).toEqual([
      {
        id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
        clerkId: "user_123",
        orgId: "org_123",
        role: "secretary",
        cro: null,
        createdAt: "2026-03-08T12:00:00.000Z",
        updatedAt: "2026-03-08T12:00:00.000Z",
      },
    ])
  })

  it("should return an empty array when no users are found", async () => {
    selectWhereMock.mockResolvedValueOnce([])

    const output = await listUsersUseCase(input)

    expect(output).toEqual([])
  })
})
