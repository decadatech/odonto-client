import type { FastifyReply, FastifyRequest } from "fastify"

import { createAppointmentUseCase } from "../../../use-cases/create-appointment-use-case/index"
import { getAppointmentByIdUseCase } from "../../../use-cases/get-appointment-by-id-use-case/index"
import { updateAppointmentUseCase } from "../../../use-cases/update-appointment-use-case/index"
import {
  createAppointmentBodySchema,
  getAppointmentByIdParamsSchema,
  updateAppointmentBodySchema,
  updateAppointmentParamsSchema,
} from "../../../schemas/appointments"
import { AppError } from "../../errors/app-error"

export class AppointmentController {
  async create(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const body = createAppointmentBodySchema.parse(request.body)

    const appointment = await createAppointmentUseCase({
      orgId,
      ...body,
    })

    return reply.status(201).send(appointment)
  }

  async update(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const params = updateAppointmentParamsSchema.parse(request.params)
    const body = updateAppointmentBodySchema.parse(request.body)

    const appointment = await updateAppointmentUseCase({
      orgId,
      appointmentId: params.appointment_id,
      ...body,
    })

    return reply.status(200).send(appointment)
  }

  async getById(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const params = getAppointmentByIdParamsSchema.parse(request.params)

    const appointment = await getAppointmentByIdUseCase({
      orgId,
      appointmentId: params.appointment_id,
    })

    return reply.status(200).send(appointment)
  }
}
