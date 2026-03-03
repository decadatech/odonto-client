import Fastify from "fastify"
import fastifyRequestContext from "@fastify/request-context"

import { healthCheckRoutes } from "./http/routes/health-check-routes"
import { patientsRoutes } from "./http/routes/patients-routes"

declare module '@fastify/request-context' {
  interface RequestContextData {
    userId: string
    orgId: string
  }
}

export function buildApp() {
  const app = Fastify()

  app.register(fastifyRequestContext)

  app.register(healthCheckRoutes)

  return app
}
