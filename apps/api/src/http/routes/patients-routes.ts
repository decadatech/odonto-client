import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"

import { PatientController } from "../controllers/patient-controller/index"
import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import {
  listPatientsResponseSchema,
  getPatientByIdParamsSchema,
  getPatientByIdResponseSchema,
  createPatientBodySchema,
  createPatientResponseSchema,
  updatePatientBodySchema,
  updatePatientParamsSchema,
  updatePatientResponseSchema,
} from "../../schemas/patients"

export const patientsRoutes: FastifyPluginAsyncZod = async (app) => {
  const patientController = new PatientController()

  app.get(
    "/patients/:patient_id",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        params: getPatientByIdParamsSchema,
        response: {
          200: getPatientByIdResponseSchema,
        },
      },
    },
    patientController.getById.bind(patientController),
  )

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

  app.put(
    "/patients/:patient_id",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        params: updatePatientParamsSchema,
        body: updatePatientBodySchema,
        response: {
          200: updatePatientResponseSchema,
        },
      },
    },
    patientController.update.bind(patientController),
  )
}
