import type { FastifyReply, FastifyRequest } from "fastify"

import { createPatientUseCase } from "../../../use-cases/create-patient-use-case/index"
import { createPatientBodySchema } from "../../../schemas/patients"
import { AppError } from "../../errors/app-error"

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

export class PatientController {
  async create(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const body = createPatientBodySchema.parse(request.body)

    const patient = await createPatientUseCase({
      orgId,
      ...body,
      rg: onlyDigits(body.rg),
      cpf: onlyDigits(body.cpf),
      phone: onlyDigits(body.phone),
      zipCode: onlyDigits(body.zipCode),
    })

    return reply.status(201).send(patient)
  }
}
