import type { FastifyReply, FastifyRequest } from "fastify"

export class HealthCheckController {
  async healthCheck(_request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({ message: "Hello World" })
  }
}
