import type { FastifyReply, FastifyRequest } from "fastify"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { verifyToken } from "@clerk/backend"
import { ensureAuthenticated } from "."

vi.mock("@clerk/backend", () => ({
  verifyToken: vi.fn(),
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

function createRequestMock(authorization?: string) {
  const request = {
    headers: {
      authorization,
    },
    requestContext: {
      set: vi.fn(),
      get: vi.fn(),
      getStore: vi.fn(),
    },
  }

  return request as unknown as FastifyRequest & {
    requestContext: {
      set: ReturnType<typeof vi.fn>
      get: ReturnType<typeof vi.fn>
      getStore: ReturnType<typeof vi.fn>
    }
  }
}

describe("ensureAuthenticated middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw 401 when authorization header is missing", async () => {
    const request = createRequestMock()
    const reply = createReplyMock()

    await expect(ensureAuthenticated(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "MISSING_AUTHORIZATION_HEADER",
      }),
    )
  })

  it("should throw 401 when authorization header is invalid", async () => {
    const request = createRequestMock("Basic invalid-token")
    const reply = createReplyMock()

    await expect(ensureAuthenticated(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "INVALID_AUTHORIZATION_HEADER",
      }),
    )
  })

  it("should throw 401 when token verification throws", async () => {
    const request = createRequestMock("Bearer valid-token")
    const reply = createReplyMock()
    vi.mocked(verifyToken).mockRejectedValueOnce(new Error("invalid token"))

    await expect(ensureAuthenticated(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "INVALID_AUTHENTICATION_TOKEN",
      }),
    )
  })

  it("should throw 401 when payload has no userId or orgId", async () => {
    const request = createRequestMock("Bearer valid-token")
    const reply = createReplyMock()
    vi.mocked(verifyToken).mockResolvedValueOnce({
      userId: "user_123",
    } as never)

    await expect(ensureAuthenticated(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "INVALID_AUTHENTICATION_TOKEN",
      }),
    )
  })

  it("should set userId and orgId in request context when payload is valid", async () => {
    const request = createRequestMock("Bearer valid-token")
    const reply = createReplyMock()
    vi.mocked(verifyToken).mockResolvedValueOnce({
      userId: "user_123",
      orgId: "org_123",
    } as never)

    await ensureAuthenticated(request, reply)

    expect(verifyToken).toHaveBeenCalledWith("valid-token", {
      secretKey: process.env.CLERK_SECRET_KEY,
    })
    expect(request.requestContext.set).toHaveBeenNthCalledWith(1, "userId", "user_123")
    expect(request.requestContext.set).toHaveBeenNthCalledWith(2, "orgId", "org_123")
    expect(reply.status).not.toHaveBeenCalled()
  })
})
