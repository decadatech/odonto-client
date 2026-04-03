import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"

import { AppointmentController } from "../controllers/appointment-controller/index"
import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import {
  createAppointmentBodySchema,
  createAppointmentResponseSchema,
  getAppointmentByIdParamsSchema,
  getAppointmentByIdResponseSchema,
  listAppointmentsQuerySchema,
  listAppointmentsResponseSchema,
  updateAppointmentBodySchema,
  updateAppointmentParamsSchema,
  updateAppointmentResponseSchema,
} from "../../schemas/appointments"

export const appointmentsRoutes: FastifyPluginAsyncZod = async (app) => {
  const appointmentController = new AppointmentController()

  app.get(
    "/appointments",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        querystring: listAppointmentsQuerySchema,
        response: {
          200: listAppointmentsResponseSchema,
        },
      },
    },
    appointmentController.list.bind(appointmentController),
  )

  app.post(
    "/appointments",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        body: createAppointmentBodySchema,
        response: {
          201: createAppointmentResponseSchema,
        },
      },
    },
    appointmentController.create.bind(appointmentController),
  )

  app.patch(
    "/appointments/:appointment_id",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        params: updateAppointmentParamsSchema,
        body: updateAppointmentBodySchema,
        response: {
          200: updateAppointmentResponseSchema,
        },
      },
    },
    appointmentController.update.bind(appointmentController),
  )

  app.get(
    "/appointments/:appointment_id",
    {
      preHandler: [ensureAuthenticated],
      schema: {
        params: getAppointmentByIdParamsSchema,
        response: {
          200: getAppointmentByIdResponseSchema,
        },
      },
    },
    appointmentController.getById.bind(appointmentController),
  )
}
