import type { FastifyInstance } from "fastify"

import { HealthCheckController } from "../controllers/health-check-controller"

export async function healthCheckRoutes(app: FastifyInstance) {
  const healthCheckController = new HealthCheckController()

  app.get("/health", healthCheckController.healthCheck.bind(healthCheckController))
}
