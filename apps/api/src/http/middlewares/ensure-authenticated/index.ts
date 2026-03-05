import type { FastifyReply, FastifyRequest } from "fastify"
import { verifyToken } from "@clerk/backend"

import { env } from "../../../env"
import { AppError } from "../../errors/app-error"

export async function ensureAuthenticated(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    throw new AppError(401, "MISSING_AUTHORIZATION_HEADER", "Missing authorization header")
  }

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token) {
    throw new AppError(401, "INVALID_AUTHORIZATION_HEADER", "Invalid authorization header")
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    })

    const { userId, orgId } = payload as { userId?: string, orgId?: string }

    if (!userId || !orgId) {
      throw new AppError(401, "INVALID_AUTHENTICATION_TOKEN", "Invalid authentication token")
    }

    request.requestContext.set("userId", userId)
    request.requestContext.set("orgId", orgId)
  } catch {
    throw new AppError(401, "INVALID_AUTHENTICATION_TOKEN", "Invalid authentication token")
  }
}
