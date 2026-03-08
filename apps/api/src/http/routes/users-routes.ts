import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"

import { UsersController } from "../controllers/users-controller"
import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import {
  createUserBodySchema,
  createUserResponseSchema,
  getUserByExternalIdParamsSchema,
  getUserByExternalIdResponseSchema,
} from "../../schemas/users"

export const usersRoutes: FastifyPluginAsyncZod = async (app) => {
  const usersController = new UsersController()

  app.get(
    "/users/external_id/:user_id",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        params: getUserByExternalIdParamsSchema,
        response: {
          200: getUserByExternalIdResponseSchema,
        },
      },
    },
    usersController.getByExternalId.bind(usersController),
  )

  app.post(
    "/users",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        body: createUserBodySchema,
        response: {
          201: createUserResponseSchema,
        },
      },
    },
    usersController.create.bind(usersController),
  )
}
