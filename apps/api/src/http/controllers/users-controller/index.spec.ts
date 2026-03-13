import type { FastifyReply, FastifyRequest } from "fastify"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createUserUseCase } from "../../../use-cases/create-user-use-case/index"
import { getUserByExternalIdUseCase } from "../../../use-cases/get-user-by-external-id-use-case/index"
import { listUsersUseCase } from "../../../use-cases/list-users-use-case"
import { UsersController } from "."
import { AppError } from "../../errors/app-error"

vi.mock("../../../use-cases/create-user-use-case/index", () => ({
  createUserUseCase: vi.fn(),
}))

vi.mock("../../../use-cases/get-user-by-external-id-use-case/index", () => ({
  getUserByExternalIdUseCase: vi.fn(),
}))

vi.mock("../../../use-cases/list-users-use-case", () => ({
  listUsersUseCase: vi.fn(),
}))

function createReplyMock() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  }

  return reply as unknown as FastifyReply & {
    status: ReturnType<typeof vi.fn>
    send: ReturnType<typeof vi.fn>
  }
}

function createRequestMock({
  body,
  params,
  query,
  orgId,
  userId,
}: {
  body: unknown
  params?: unknown
  query?: unknown
  orgId?: string
  userId?: string
}) {
  const request = {
    body,
    params,
    query,
    requestContext: {
      get: vi.fn((key: string) => {
        if (key === "orgId") return orgId
        if (key === "userId") return userId
        return undefined
      }),
      set: vi.fn(),
      getStore: vi.fn(),
    },
  }

  return request as unknown as FastifyRequest & {
    requestContext: {
      get: ReturnType<typeof vi.fn>
      set: ReturnType<typeof vi.fn>
      getStore: ReturnType<typeof vi.fn>
    }
  }
}

describe("UsersController.getByExternalId", () => {
  const controller = new UsersController()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw UNAUTHENTICATED when orgId is missing", async () => {
    const request = createRequestMock({
      body: {},
      params: { user_id: "user_123" },
      orgId: undefined,
    })
    const reply = createReplyMock()

    await expect(controller.getByExternalId(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "UNAUTHENTICATED",
      }),
    )

    expect(getUserByExternalIdUseCase).not.toHaveBeenCalled()
  })

  it("should throw when request params are invalid", async () => {
    const request = createRequestMock({
      body: {},
      params: { user_id: "" },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    await expect(controller.getByExternalId(request, reply)).rejects.toThrow()

    expect(getUserByExternalIdUseCase).not.toHaveBeenCalled()
  })

  it("should propagate USER_NOT_FOUND thrown by use-case", async () => {
    const request = createRequestMock({
      body: {},
      params: { user_id: "user_123" },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    vi.mocked(getUserByExternalIdUseCase).mockRejectedValueOnce(
      new AppError(404, "USER_NOT_FOUND", "User not found"),
    )

    await expect(controller.getByExternalId(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 404,
        code: "USER_NOT_FOUND",
      }),
    )
  })

  it("should return 200 with user payload", async () => {
    const request = createRequestMock({
      body: {},
      params: { user_id: "user_123" },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    vi.mocked(getUserByExternalIdUseCase).mockResolvedValueOnce({
      id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
      clerkId: "user_123",
      orgId: "org_123",
      role: "dentist",
      cro: "123456",
      createdAt: "2026-03-08T12:00:00.000Z",
      updatedAt: "2026-03-08T12:00:00.000Z",
    })

    await controller.getByExternalId(request, reply)

    expect(getUserByExternalIdUseCase).toHaveBeenCalledWith({
      orgId: "org_123",
      clerkId: "user_123",
    })
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({
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

describe("UsersController.list", () => {
  const controller = new UsersController()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw UNAUTHENTICATED when orgId is missing", async () => {
    const request = createRequestMock({
      body: {},
      query: { role: "dentist" },
      orgId: undefined,
    })
    const reply = createReplyMock()

    await expect(controller.list(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "UNAUTHENTICATED",
      }),
    )

    expect(listUsersUseCase).not.toHaveBeenCalled()
  })

  it("should throw when request query is invalid", async () => {
    const request = createRequestMock({
      body: {},
      query: { role: "invalid-role" },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    await expect(controller.list(request, reply)).rejects.toThrow()

    expect(listUsersUseCase).not.toHaveBeenCalled()
  })

  it("should call use-case with normalized roles and return 200", async () => {
    const request = createRequestMock({
      body: {},
      query: { role: ["dentist", "secretary"] },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    vi.mocked(listUsersUseCase).mockResolvedValueOnce([
      {
        id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
        clerkId: "user_123",
        orgId: "org_123",
        role: "dentist",
        cro: "123456",
        createdAt: "2026-03-08T12:00:00.000Z",
        updatedAt: "2026-03-08T12:00:00.000Z",
      },
    ])

    await controller.list(request, reply)

    expect(listUsersUseCase).toHaveBeenCalledWith({
      orgId: "org_123",
      roles: ["dentist", "secretary"],
    })
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith([
      {
        id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
        clerkId: "user_123",
        orgId: "org_123",
        role: "dentist",
        cro: "123456",
        createdAt: "2026-03-08T12:00:00.000Z",
        updatedAt: "2026-03-08T12:00:00.000Z",
      },
    ])
  })
})

describe("UsersController.create", () => {
  const controller = new UsersController()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw UNAUTHENTICATED when orgId or userId is missing", async () => {
    const request = createRequestMock({
      body: {
        role: "secretary",
      },
      orgId: "org_123",
      userId: undefined,
    })
    const reply = createReplyMock()

    await expect(controller.create(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "UNAUTHENTICATED",
      }),
    )

    expect(createUserUseCase).not.toHaveBeenCalled()
  })

  it("should throw when request body is invalid", async () => {
    const request = createRequestMock({
      body: {
        role: "invalid-role",
      },
      orgId: "org_123",
      userId: "user_123",
    })
    const reply = createReplyMock()

    await expect(controller.create(request, reply)).rejects.toThrow()

    expect(createUserUseCase).not.toHaveBeenCalled()
  })

  it("should call use-case and return 201", async () => {
    const request = createRequestMock({
      body: {
        role: "dentist",
        cro: "123456",
      },
      orgId: "org_123",
      userId: "user_123",
    })
    const reply = createReplyMock()

    vi.mocked(createUserUseCase).mockResolvedValueOnce({
      id: "7be70a0a-5a25-489b-8de0-af198f7cfd4d",
      clerkId: "user_123",
      orgId: "org_123",
      role: "dentist",
      cro: "123456",
      createdAt: "2026-03-08T12:00:00.000Z",
      updatedAt: "2026-03-08T12:00:00.000Z",
    })

    await controller.create(request, reply)

    expect(createUserUseCase).toHaveBeenCalledWith({
      orgId: "org_123",
      clerkId: "user_123",
      role: "dentist",
      cro: "123456",
    })
    expect(reply.status).toHaveBeenCalledWith(201)
  })
})
