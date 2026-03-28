/// <reference types="vitest/globals" />
import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: navigationMocks.replace,
  }),
  useSearchParams: () => navigationMocks.searchParams,
}))

vi.mock("@workspace/ui/components/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { PatientsTable } from "@/app/(private)/patients/patients-table"
import type { Patient } from "@/types/patient"

const patients: Patient[] = [
  {
    id: "patient-1",
    nome: "Maria Silva",
    rg: "123456789",
    telefone: "11999998888",
    email: "maria@example.com",
  },
  {
    id: "patient-2",
    nome: "Joao Costa",
    rg: "987654321",
    telefone: "21911112222",
    email: "joao@example.com",
  },
]

beforeEach(() => {
  navigationMocks.replace.mockClear()
  navigationMocks.searchParams = new URLSearchParams()
})

describe("PatientsTable", () => {
  it("should render skeleton rows while loading", () => {
    render(
      <PatientsTable
        patients={[]}
        isLoading
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDetails={vi.fn()}
      />,
    )

    expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(40)
    expect(screen.queryByText("Nenhum paciente encontrado")).toBeNull()
  })

  it("should render the empty state when there are no patients", () => {
    render(
      <PatientsTable
        patients={[]}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDetails={vi.fn()}
      />,
    )

    expect(screen.getByText("Nenhum paciente encontrado")).toBeTruthy()
  })

  it("should render patient data, format fields, and call edit action", () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onDetails = vi.fn()

    render(
      <PatientsTable
        patients={patients}
        isLoading={false}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetails={onDetails}
      />,
    )

    expect(screen.getByText("Maria Silva")).toBeTruthy()
    expect(screen.getByText("12.345.678-9")).toBeTruthy()
    expect(screen.getByText("(11) 99999-8888")).toBeTruthy()
    expect(screen.getByText("MS")).toBeTruthy()

    const firstRow = screen.getByText("Maria Silva").closest("tr")
    const firstRowButtons = firstRow?.querySelectorAll("button")

    expect(firstRowButtons).toHaveLength(3)
    expect((firstRowButtons?.[0] as HTMLButtonElement).disabled).toBe(true)
    expect((firstRowButtons?.[2] as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(firstRowButtons?.[1] as HTMLButtonElement)
    fireEvent.click(firstRowButtons?.[0] as HTMLButtonElement)
    fireEvent.click(firstRowButtons?.[2] as HTMLButtonElement)

    expect(onEdit).toHaveBeenCalledWith("patient-1")
    expect(onDetails).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it("should update the sort order in the url when sorting by name", () => {
    navigationMocks.searchParams = new URLSearchParams("search=maria&sort_order=asc")

    render(
      <PatientsTable
        patients={patients}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDetails={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /nome/i }))

    expect(navigationMocks.replace).toHaveBeenCalledWith("/patients?search=maria&sort_order=desc")
  })
})
