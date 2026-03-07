import type { FastifyReply, FastifyRequest } from "fastify"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createPatientUseCase } from "../../../use-cases/create-patient-use-case/index"
import { getPatientByIdUseCase } from "../../../use-cases/get-patient-by-id-use-case"
import { updatePatientUseCase } from "../../../use-cases/update-patient-use-case/index"
import { PatientController } from "."

vi.mock("../../../use-cases/create-patient-use-case/index", () => ({
  createPatientUseCase: vi.fn(),
}))

vi.mock("../../../use-cases/update-patient-use-case/index", () => ({
  updatePatientUseCase: vi.fn(),
}))

vi.mock("../../../use-cases/get-patient-by-id-use-case", () => ({
  getPatientByIdUseCase: vi.fn(),
}))

function createReplyMock() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  }

  return reply as unknown as FastifyReply & {
    status: ReturnType<typeof vi.fn>
    send: ReturnType<typeof vi.fn>
  }
}

function createRequestMock({
  body,
  params,
  orgId,
}: {
  body: unknown
  params?: unknown
  orgId?: string
}) {
  const request = {
    body,
    params,
    requestContext: {
      get: vi.fn((key: string) => {
        if (key === "orgId") return orgId
        return undefined
      }),
      set: vi.fn(),
      getStore: vi.fn(),
    },
  }

  return request as unknown as FastifyRequest & {
    requestContext: {
      get: ReturnType<typeof vi.fn>
      set: ReturnType<typeof vi.fn>
      getStore: ReturnType<typeof vi.fn>
    }
  }
}

describe("PatientController.create", () => {
  const controller = new PatientController()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw UNAUTHENTICATED when orgId is missing", async () => {
    const request = createRequestMock({
      body: {},
      orgId: undefined,
    })
    const reply = createReplyMock()

    await expect(controller.create(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "UNAUTHENTICATED",
      }),
    )

    expect(createPatientUseCase).not.toHaveBeenCalled()
  })

  it("should throw when request body is invalid", async () => {
    const request = createRequestMock({
      body: {
        name: "Maria",
        sex: "invalid-sex",
      },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    await expect(controller.create(request, reply)).rejects.toThrow()

    expect(createPatientUseCase).not.toHaveBeenCalled()
  })

  it("should call use-case with sanitized data and return 201", async () => {
    const request = createRequestMock({
      body: {
        name: "  Maria Silva  ",
        sex: "female",
        birthDate: "1990-10-10",
        rg: "12.345.678-9",
        cpf: "123.456.789-01",
        phone: "(11) 99999-8888",
        email: "  MARIA@example.com  ",
        zipCode: "01310-100",
        street: "  Rua A  ",
        streetNumber: " 100 ",
        neighborhood: " Centro ",
        city: " Sao Paulo ",
        state: " sp ",
      },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    vi.mocked(createPatientUseCase).mockResolvedValueOnce({
      id: "patient_1",
      orgId: "org_123",
      name: "Maria Silva",
      sex: "female",
      birthDate: "1990-10-10",
      rg: "123456789",
      cpf: "12345678901",
      phone: "11999998888",
      email: "maria@example.com",
      zipCode: "01310100",
      street: "Rua A",
      streetNumber: "100",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
      createdAt: "2026-03-05T12:00:00.000Z",
      updatedAt: "2026-03-05T12:00:00.000Z",
    })

    await controller.create(request, reply)

    expect(createPatientUseCase).toHaveBeenCalledWith({
      orgId: "org_123",
      name: "Maria Silva",
      sex: "female",
      birthDate: "1990-10-10",
      rg: "123456789",
      cpf: "12345678901",
      phone: "11999998888",
      email: "maria@example.com",
      zipCode: "01310100",
      street: "Rua A",
      streetNumber: "100",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
    })
    expect(reply.status).toHaveBeenCalledWith(201)
    expect(reply.send).toHaveBeenCalledWith({
      id: "patient_1",
      orgId: "org_123",
      name: "Maria Silva",
      sex: "female",
      birthDate: "1990-10-10",
      rg: "123456789",
      cpf: "12345678901",
      phone: "11999998888",
      email: "maria@example.com",
      zipCode: "01310100",
      street: "Rua A",
      streetNumber: "100",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
      createdAt: "2026-03-05T12:00:00.000Z",
      updatedAt: "2026-03-05T12:00:00.000Z",
    })
  })
})

describe("PatientController.update", () => {
  const controller = new PatientController()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw UNAUTHENTICATED when orgId is missing", async () => {
    const request = createRequestMock({
      body: {},
      params: { patient_id: "deff7f0f-9684-4991-bfce-dc5da2fed3fa" },
      orgId: undefined,
    })
    const reply = createReplyMock()

    await expect(controller.update(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "UNAUTHENTICATED",
      }),
    )

    expect(updatePatientUseCase).not.toHaveBeenCalled()
  })

  it("should throw when request params are invalid", async () => {
    const request = createRequestMock({
      body: {
        name: "Maria",
        sex: "female",
        birthDate: "1990-10-10",
        rg: "12.345.678-9",
        cpf: "123.456.789-01",
        phone: "(11) 99999-8888",
        email: "maria@example.com",
        zipCode: "01310-100",
        street: "Rua A",
        streetNumber: "100",
        neighborhood: "Centro",
        city: "Sao Paulo",
        state: "SP",
      },
      params: { patient_id: "invalid-id" },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    await expect(controller.update(request, reply)).rejects.toThrow()

    expect(updatePatientUseCase).not.toHaveBeenCalled()
  })

  it("should call use-case with sanitized data and return 200", async () => {
    const request = createRequestMock({
      body: {
        name: "  Maria Silva  ",
        sex: "female",
        birthDate: "1990-10-10",
        rg: "12.345.678-9",
        cpf: "123.456.789-01",
        phone: "(11) 99999-8888",
        email: "  MARIA@example.com  ",
        zipCode: "01310-100",
        street: "  Rua A  ",
        streetNumber: " 100 ",
        neighborhood: " Centro ",
        city: " Sao Paulo ",
        state: " sp ",
      },
      params: { patient_id: "deff7f0f-9684-4991-bfce-dc5da2fed3fa" },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    vi.mocked(updatePatientUseCase).mockResolvedValueOnce({
      id: "deff7f0f-9684-4991-bfce-dc5da2fed3fa",
      orgId: "org_123",
      name: "Maria Silva",
      sex: "female",
      birthDate: "1990-10-10",
      rg: "123456789",
      cpf: "12345678901",
      phone: "11999998888",
      email: "maria@example.com",
      zipCode: "01310100",
      street: "Rua A",
      streetNumber: "100",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
      createdAt: "2026-03-07T10:00:00.000Z",
      updatedAt: "2026-03-07T11:00:00.000Z",
    })

    await controller.update(request, reply)

    expect(updatePatientUseCase).toHaveBeenCalledWith({
      orgId: "org_123",
      patientId: "deff7f0f-9684-4991-bfce-dc5da2fed3fa",
      name: "Maria Silva",
      sex: "female",
      birthDate: "1990-10-10",
      rg: "123456789",
      cpf: "12345678901",
      phone: "11999998888",
      email: "maria@example.com",
      zipCode: "01310100",
      street: "Rua A",
      streetNumber: "100",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
    })

    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({
      id: "deff7f0f-9684-4991-bfce-dc5da2fed3fa",
      orgId: "org_123",
      name: "Maria Silva",
      sex: "female",
      birthDate: "1990-10-10",
      rg: "123456789",
      cpf: "12345678901",
      phone: "11999998888",
      email: "maria@example.com",
      zipCode: "01310100",
      street: "Rua A",
      streetNumber: "100",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
      createdAt: "2026-03-07T10:00:00.000Z",
      updatedAt: "2026-03-07T11:00:00.000Z",
    })
  })
})

describe("PatientController.getById", () => {
  const controller = new PatientController()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw UNAUTHENTICATED when orgId is missing", async () => {
    const request = createRequestMock({
      body: {},
      params: { patient_id: "deff7f0f-9684-4991-bfce-dc5da2fed3fa" },
      orgId: undefined,
    })
    const reply = createReplyMock()

    await expect(controller.getById(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "UNAUTHENTICATED",
      }),
    )

    expect(getPatientByIdUseCase).not.toHaveBeenCalled()
  })

  it("should throw when request params are invalid", async () => {
    const request = createRequestMock({
      body: {},
      params: { patient_id: "invalid-id" },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    await expect(controller.getById(request, reply)).rejects.toThrow()

    expect(getPatientByIdUseCase).not.toHaveBeenCalled()
  })

  it("should call use-case and return 200", async () => {
    const request = createRequestMock({
      body: {},
      params: { patient_id: "deff7f0f-9684-4991-bfce-dc5da2fed3fa" },
      orgId: "org_123",
    })
    const reply = createReplyMock()

    vi.mocked(getPatientByIdUseCase).mockResolvedValueOnce({
      id: "deff7f0f-9684-4991-bfce-dc5da2fed3fa",
      orgId: "org_123",
      name: "Maria Silva",
      sex: "female",
      birthDate: "1990-10-10",
      rg: "123456789",
      cpf: "12345678901",
      phone: "11999998888",
      email: "maria@example.com",
      zipCode: "01310100",
      street: "Rua A",
      streetNumber: "100",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
      createdAt: "2026-03-07T10:00:00.000Z",
      updatedAt: "2026-03-07T11:00:00.000Z",
    })

    await controller.getById(request, reply)

    expect(getPatientByIdUseCase).toHaveBeenCalledWith({
      orgId: "org_123",
      patientId: "deff7f0f-9684-4991-bfce-dc5da2fed3fa",
    })

    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({
      id: "deff7f0f-9684-4991-bfce-dc5da2fed3fa",
      orgId: "org_123",
      name: "Maria Silva",
      sex: "female",
      birthDate: "1990-10-10",
      rg: "123456789",
      cpf: "12345678901",
      phone: "11999998888",
      email: "maria@example.com",
      zipCode: "01310100",
      street: "Rua A",
      streetNumber: "100",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
      createdAt: "2026-03-07T10:00:00.000Z",
      updatedAt: "2026-03-07T11:00:00.000Z",
    })
  })
})
