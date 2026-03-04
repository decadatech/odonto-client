import Fastify from "fastify"
import fastifyRequestContext from "@fastify/request-context"
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"

import { healthCheckRoutes } from "./http/routes/health-check-routes"
import { patientsRoutes } from "./http/routes/patients-routes"

export function buildApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifyRequestContext)

  app.register(healthCheckRoutes)

  return app
}
