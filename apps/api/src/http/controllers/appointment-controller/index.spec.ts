import type { FastifyReply, FastifyRequest } from "fastify"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { listAppointmentsUseCase } from "../../../use-cases/list-appointments-use-case/index"
import { AppointmentController } from "."

vi.mock("../../../use-cases/list-appointments-use-case/index", () => ({
  listAppointmentsUseCase: vi.fn(),
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
  orgId,
  query,
}: {
  orgId?: string
  query?: Record<string, unknown>
}) {
  const request = {
    query,
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

describe("AppointmentController.list", () => {
  const controller = new AppointmentController()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should throw UNAUTHENTICATED when orgId is missing", async () => {
    const request = createRequestMock({
      orgId: undefined,
      query: {
        from: "2026-03-13T00:00:00.000Z",
        to: "2026-03-14T00:00:00.000Z",
      },
    })
    const reply = createReplyMock()

    await expect(controller.list(request, reply)).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: "UNAUTHENTICATED",
      }),
    )

    expect(listAppointmentsUseCase).not.toHaveBeenCalled()
  })

  it("should call use-case and return 200", async () => {
    const request = createRequestMock({
      orgId: "org_123",
      query: {},
    })
    const reply = createReplyMock()

    vi.mocked(listAppointmentsUseCase).mockResolvedValueOnce([
      {
        id: "6e4687ae-6471-4a2a-b161-24984924b125",
        orgId: "org_123",
        patientId: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
        dentistUserId: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
        startsAt: "2026-03-13T10:00:00.000Z",
        endsAt: "2026-03-13T11:00:00.000Z",
        title: "Consulta de rotina",
        description: "Retorno semestral",
        patient: {
          id: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
          name: "Maria Silva",
        },
        dentist: {
          id: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
          name: "Dra. Ana",
        },
        createdAt: "2026-03-13T09:00:00.000Z",
        updatedAt: "2026-03-13T09:00:00.000Z",
      },
    ])

    await controller.list(request, reply)

    expect(listAppointmentsUseCase).toHaveBeenCalledWith({
      orgId: "org_123",
      from: undefined,
      to: undefined,
      patientIds: undefined,
      dentistUserIds: undefined,
    })
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith([
      {
        id: "6e4687ae-6471-4a2a-b161-24984924b125",
        orgId: "org_123",
        patientId: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
        dentistUserId: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
        startsAt: "2026-03-13T10:00:00.000Z",
        endsAt: "2026-03-13T11:00:00.000Z",
        title: "Consulta de rotina",
        description: "Retorno semestral",
        patient: {
          id: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
          name: "Maria Silva",
        },
        dentist: {
          id: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
          name: "Dra. Ana",
        },
        createdAt: "2026-03-13T09:00:00.000Z",
        updatedAt: "2026-03-13T09:00:00.000Z",
      },
    ])
  })

  it("should parse comma-separated patient and dentist ids from query", async () => {
    const request = createRequestMock({
      orgId: "org_123",
      query: {
        from: "2026-03-13T00:00:00.000Z",
        to: "2026-03-14T00:00:00.000Z",
        patient_ids: "30e87f1c-a387-4ccd-9904-6980dd8eef2f,4c5d96ee-d4b9-4a5c-bb7f-c1774ba4d09d",
        dentist_user_ids: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
      },
    })
    const reply = createReplyMock()

    vi.mocked(listAppointmentsUseCase).mockResolvedValueOnce([])

    await controller.list(request, reply)

    expect(listAppointmentsUseCase).toHaveBeenCalledWith({
      orgId: "org_123",
      from: "2026-03-13T00:00:00.000Z",
      to: "2026-03-14T00:00:00.000Z",
      patientIds: [
        "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
        "4c5d96ee-d4b9-4a5c-bb7f-c1774ba4d09d",
      ],
      dentistUserIds: ["0fa67a3f-f95e-4bb6-a788-4d4329b9fd75"],
    })
  })

  it("should reject an invalid timeframe", async () => {
    const request = createRequestMock({
      orgId: "org_123",
      query: {
        from: "2026-03-14T00:00:00.000Z",
        to: "2026-03-13T00:00:00.000Z",
      },
    })
    const reply = createReplyMock()

    await expect(controller.list(request, reply)).rejects.toBeInstanceOf(Error)
    expect(listAppointmentsUseCase).not.toHaveBeenCalled()
  })

  it("should reject when only one timeframe bound is provided", async () => {
    const request = createRequestMock({
      orgId: "org_123",
      query: {
        from: "2026-03-13T00:00:00.000Z",
      },
    })
    const reply = createReplyMock()

    await expect(controller.list(request, reply)).rejects.toBeInstanceOf(Error)
    expect(listAppointmentsUseCase).not.toHaveBeenCalled()
  })
})
