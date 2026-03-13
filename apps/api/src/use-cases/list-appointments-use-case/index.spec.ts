import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  listAppointmentsUseCase,
  type ListAppointmentsUseCaseInput,
} from "."

const selectWhereMock = vi.hoisted(() => vi.fn())
const selectInnerJoinSecondMock = vi.hoisted(() => vi.fn(() => ({ where: selectWhereMock })))
const selectInnerJoinFirstMock = vi.hoisted(() => vi.fn(() => ({ innerJoin: selectInnerJoinSecondMock })))
const selectFromMock = vi.hoisted(() => vi.fn(() => ({ innerJoin: selectInnerJoinFirstMock })))
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: selectFromMock })))

vi.mock("../../db", () => ({
  db: {
    select: selectMock,
  },
}))

describe("listAppointmentsUseCase", () => {
  const input: ListAppointmentsUseCaseInput = {
    orgId: "org_123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return appointments with patient and dentist relationships", async () => {
    const now = new Date("2026-03-13T09:00:00.000Z")

    selectWhereMock.mockResolvedValueOnce([
      {
        appointment: {
          id: "6e4687ae-6471-4a2a-b161-24984924b125",
          orgId: input.orgId,
          patientId: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
          dentistUserId: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
          startsAt: new Date("2026-03-13T10:00:00.000Z"),
          endsAt: new Date("2026-03-13T11:00:00.000Z"),
          title: "Consulta de rotina",
          description: "Retorno semestral",
          createdAt: now,
          updatedAt: now,
        },
        patient: {
          id: "30e87f1c-a387-4ccd-9904-6980dd8eef2f",
          name: "Maria Silva",
        },
        dentist: {
          id: "0fa67a3f-f95e-4bb6-a788-4d4329b9fd75",
          name: "Dra. Ana",
        },
      },
    ])

    const output = await listAppointmentsUseCase(input)

    expect(output).toEqual([
      {
        id: "6e4687ae-6471-4a2a-b161-24984924b125",
        orgId: input.orgId,
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

  it("should return an empty array when no appointments are found", async () => {
    selectWhereMock.mockResolvedValueOnce([])

    const output = await listAppointmentsUseCase(input)

    expect(output).toEqual([])
  })
})
