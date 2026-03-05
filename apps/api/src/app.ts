import Fastify from "fastify"
import fastifyRequestContext from "@fastify/request-context"
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"

import { healthCheckRoutes } from "./http/routes/health-check-routes"
import { patientsRoutes } from "./http/routes/patients-routes"
import { registerGlobalErrorHandler } from "./http/errors/error-handler"

export function buildApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifyRequestContext)
  
  registerGlobalErrorHandler(app)

  app.register(healthCheckRoutes)
  app.register(patientsRoutes)

  return app
}
