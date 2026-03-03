import Fastify from "fastify"

import { healthCheckRoutes } from "./http/routes/health-check-routes"

export function buildApp() {
  const app = Fastify()

  app.register(healthCheckRoutes)

  return app
}
