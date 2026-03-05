import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"

import { PatientController } from "../controllers/patient-controller/index"
import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import {
  createPatientBodySchema,
  createPatientResponseSchema,
} from "../../schemas/patients"

export const patientsRoutes: FastifyPluginAsyncZod = async (app) => {
  const patientController = new PatientController()

  app.post(
    "/patients",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        body: createPatientBodySchema,
        response: {
          201: createPatientResponseSchema,
        },
      },
    },
    patientController.create.bind(patientController),
  )
}
