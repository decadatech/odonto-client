import { beforeEach, describe, expect, it, vi } from "vitest"

import { createUserUseCase, type CreateUserUseCaseInput } from "."

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

describe("createUserUseCase", () => {
  const input: CreateUserUseCaseInput = {
    orgId: "org_123",
    clerkId: "user_123",
    role: "dentist",
    cro: "123456",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw USER_CRO_REQUIRED when role is dentist and CRO is missing", async () => {
    await expect(
      createUserUseCase({
        ...input,
        cro: null,
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        status: 400,
        code: "USER_CRO_REQUIRED",
      }),
    )

    expect(insertMock).not.toHaveBeenCalled()
  })

  it("should throw USER_ALREADY_EXISTS when user already exists", async () => {
    selectLimitMock.mockResolvedValueOnce([{ id: "a8f77cdc-5548-45e5-bef7-d2f0684a1b4e" }])

    await expect(createUserUseCase(input)).rejects.toEqual(
      expect.objectContaining({
        status: 409,
        code: "USER_ALREADY_EXISTS",
      }),
    )

    expect(insertMock).not.toHaveBeenCalled()
  })

  it("should create user and return output", async () => {
    const now = new Date("2026-03-08T12:00:00.000Z")

    selectLimitMock.mockResolvedValueOnce([])
    insertReturningMock.mockResolvedValueOnce([
      {
        id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
        clerkId: input.clerkId,
        orgId: input.orgId,
        role: input.role,
        cro: input.cro,
        createdAt: now,
        updatedAt: now,
      },
    ])

    const output = await createUserUseCase(input)

    expect(insertValuesMock).toHaveBeenCalledWith({
      orgId: input.orgId,
      clerkId: input.clerkId,
      role: input.role,
      cro: input.cro,
    })

    expect(output).toEqual({
      id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
      clerkId: input.clerkId,
      orgId: input.orgId,
      role: input.role,
      cro: input.cro,
      createdAt: "2026-03-08T12:00:00.000Z",
      updatedAt: "2026-03-08T12:00:00.000Z",
    })
  })
})
