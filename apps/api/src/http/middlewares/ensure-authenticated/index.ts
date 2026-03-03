import type { FastifyReply, FastifyRequest } from "fastify"
import { verifyToken } from "@clerk/backend"

import { env } from "../../../env"

export async function ensureAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return reply.status(401).send({ message: "Missing authorization header" })
  }

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token) {
    return reply.status(401).send({ message: "Invalid authorization header" })
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    })

    const userId = payload.sub
    const orgId = (payload as { org_id?: string }).org_id

    if (!userId || !orgId) {
      return reply.status(401).send({ message: "Invalid authentication token" })
    }

    request.requestContext.set("userId", userId)
    request.requestContext.set("orgId", orgId)
  } catch {
    return reply.status(401).send({ message: "Invalid authentication token" })
  }
}
