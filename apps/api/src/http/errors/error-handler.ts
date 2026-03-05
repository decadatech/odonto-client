import type { FastifyInstance } from "fastify"
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod"

import { AppError } from "./app-error"

type ErrorPayload = {
  status: number
  code: string
  details: unknown
}

export function registerGlobalErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const payload: ErrorPayload = {
        status: 400,
        code: "VALIDATION_ERROR",
        details: error.validation.map((issue) => ({
          message: issue.message,
          instancePath: issue.instancePath,
          keyword: issue.keyword,
          params: issue.params,
        })),
      }

      return reply.status(payload.status).send(payload)
    }

    if (isResponseSerializationError(error)) {
      const payload: ErrorPayload = {
        status: 500,
        code: "RESPONSE_SERIALIZATION_ERROR",
        details: error.cause.issues.map((issue) => ({
          message: issue.message,
          path: issue.path,
        })),
      }

      return reply.status(payload.status).send(payload)
    }

    if (error instanceof AppError) {
      const payload: ErrorPayload = {
        status: error.status,
        code: error.code,
        details: error.details,
      }

      return reply.status(payload.status).send(payload)
    }

    const payload: ErrorPayload = {
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      details: "An unexpected error occurred",
    }

    return reply.status(payload.status).send(payload)
  })
}
