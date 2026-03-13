import type { FastifyReply, FastifyRequest } from "fastify"

import { createUserUseCase } from "../../../use-cases/create-user-use-case/index"
import { getUserByExternalIdUseCase } from "../../../use-cases/get-user-by-external-id-use-case/index"
import { listUsersUseCase } from "../../../use-cases/list-users-use-case"
import {
  createUserBodySchema,
  getUserByExternalIdParamsSchema,
  listUsersQuerySchema,
} from "../../../schemas/users"
import { AppError } from "../../errors/app-error"

export class UsersController {
  async list(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const query = listUsersQuerySchema.parse(request.query)

    const users = await listUsersUseCase({
      orgId,
      roles: query.role,
    })

    return reply.status(200).send(users)
  }

  async getByExternalId(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const params = getUserByExternalIdParamsSchema.parse(request.params)

    const user = await getUserByExternalIdUseCase({
      orgId,
      clerkId: params.user_id,
    })

    return reply.status(200).send(user)
  }

  async create(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")
    const userId = request.requestContext.get("userId")

    if (!orgId || !userId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const body = createUserBodySchema.parse(request.body)

    const user = await createUserUseCase({
      orgId,
      clerkId: userId,
      role: body.role,
      cro: body.cro,
    })

    return reply.status(201).send(user)
  }
}
