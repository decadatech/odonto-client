/// <reference types="vitest/globals" />
import * as React from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"

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

let container: HTMLDivElement | null = null
let root: Root | null = null

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

function render(element: React.ReactNode) {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)

  act(() => {
    root?.render(element)
  })
}

beforeEach(() => {
  navigationMocks.replace.mockClear()
  navigationMocks.searchParams = new URLSearchParams()
})

afterEach(() => {
  act(() => {
    root?.unmount()
  })

  container?.remove()
  container = null
  root = null
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
    expect(document.body.textContent).not.toContain("Nenhum paciente encontrado")
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

    expect(document.body.textContent).toContain("Nenhum paciente encontrado")
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

    expect(document.body.textContent).toContain("Maria Silva")
    expect(document.body.textContent).toContain("12.345.678-9")
    expect(document.body.textContent).toContain("(11) 99999-8888")
    expect(document.body.textContent).toContain("MS")

    const firstRowButtons = document.querySelectorAll("tbody tr:first-child button")
    expect(firstRowButtons).toHaveLength(3)
    expect((firstRowButtons[0] as HTMLButtonElement).disabled).toBe(true)
    expect((firstRowButtons[2] as HTMLButtonElement).disabled).toBe(true)

    act(() => {
      ;(firstRowButtons[1] as HTMLButtonElement).click()
      ;(firstRowButtons[0] as HTMLButtonElement).click()
      ;(firstRowButtons[2] as HTMLButtonElement).click()
    })

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

    const sortTrigger = document.querySelector('[data-slot="table-head"] [role="button"]') as HTMLDivElement

    act(() => {
      sortTrigger.click()
    })

    expect(navigationMocks.replace).toHaveBeenCalledWith("/patients?search=maria&sort_order=desc")
  })
})
