import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getUserByExternalIdUseCase,
  type GetUserByExternalIdUseCaseInput,
} from "."

const selectWhereMock = vi.hoisted(() => vi.fn())
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: selectFromMock })))

vi.mock("../../db", () => ({
  db: {
    select: selectMock,
  },
}))

describe("getUserByExternalIdUseCase", () => {
  const input: GetUserByExternalIdUseCaseInput = {
    orgId: "org_123",
    clerkId: "user_123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw USER_NOT_FOUND when user does not exist", async () => {
    selectWhereMock.mockResolvedValueOnce([])

    await expect(getUserByExternalIdUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "USER_NOT_FOUND",
      }),
    )
  })

  it("should return user when found", async () => {
    const now = new Date("2026-03-08T12:00:00.000Z")

    selectWhereMock.mockResolvedValueOnce([
      {
        id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
        clerkId: "user_123",
        orgId: "org_123",
        role: "dentist",
        cro: "123456",
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await getUserByExternalIdUseCase(input)

    expect(output).toEqual({
      id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
      clerkId: "user_123",
      orgId: "org_123",
      role: "dentist",
      cro: "123456",
      createdAt: "2026-03-08T12:00:00.000Z",
      updatedAt: "2026-03-08T12:00:00.000Z",
    })
  })
})
