import type { FastifyReply, FastifyRequest } from "fastify"

import { getPatientByIdUseCase } from "../../../use-cases/get-patient-by-id-use-case"
import { createPatientUseCase } from "../../../use-cases/create-patient-use-case/index"
import { updatePatientUseCase } from "../../../use-cases/update-patient-use-case/index"
import { listPatientsUseCase } from "../../../use-cases/list-patients-use-case"
import {
  createPatientBodySchema,
  getPatientByIdParamsSchema,
  listPatientsQuerySchema,
  updatePatientBodySchema,
  updatePatientParamsSchema,
} from "../../../schemas/patients"
import { AppError } from "../../errors/app-error"

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

export class PatientController {
  async getById(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const params = getPatientByIdParamsSchema.parse(request.params)

    const patient = await getPatientByIdUseCase({
      orgId,
      patientId: params.patient_id,
    })

    return reply.status(200).send(patient)
  }

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

  async update(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const params = updatePatientParamsSchema.parse(request.params)
    const body = updatePatientBodySchema.parse(request.body)

    const patient = await updatePatientUseCase({
      orgId,
      patientId: params.patient_id,
      ...body,
      rg: onlyDigits(body.rg),
      cpf: onlyDigits(body.cpf),
      phone: onlyDigits(body.phone),
      zipCode: onlyDigits(body.zipCode),
    })

    return reply.status(200).send(patient)
  }

  async list(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const orgId = request.requestContext.get("orgId")

    if (!orgId) {
      throw new AppError(401, "UNAUTHENTICATED", "Unauthenticated request")
    }

    const query = listPatientsQuerySchema.parse(request.query)
    const patients = await listPatientsUseCase({
      orgId,
      cursor: query.cursor,
      limit: query.limit,
      search: query.search,
      sortBy: query.sort_by,
      sortOrder: query.sort_order,
    })

    return reply.status(200).send(patients)
  }
}
