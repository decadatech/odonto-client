import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

import { PatientsTable } from "."
import type { Patient } from "@/types/patient"

const queryStateMocks = vi.hoisted(() => ({
  setSortOrder: vi.fn(),
  sortOrder: "asc" as "asc" | "desc",
}))
const infiniteScrollMocks = vi.hoisted(() => ({
  useInfiniteScroll: vi.fn(),
  ref: { current: null },
}))

vi.mock("../../hooks/use-patients-table-params", () => ({
  usePatientsTableParams: () => ({
    search: "",
    setSearch: vi.fn(),
    sortOrder: queryStateMocks.sortOrder,
    setSortOrder: queryStateMocks.setSortOrder,
  }),
}))

vi.mock("@/hooks/use-infinite-scroll", () => ({
  useInfiniteScroll: (...args: unknown[]) => infiniteScrollMocks.useInfiniteScroll(...args),
}))

vi.mock("@workspace/ui/components/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))


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
  queryStateMocks.setSortOrder.mockClear()
  queryStateMocks.sortOrder = "asc"
  infiniteScrollMocks.useInfiniteScroll.mockReset()
  infiniteScrollMocks.useInfiniteScroll.mockReturnValue(infiniteScrollMocks.ref)
})

describe("PatientsTable", () => {
  it("should render skeleton rows while loading", () => {
    render(
      <PatientsTable
        patients={[]}
        isLoading
        hasMore={false}
        isLoadingMore={false}
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
        hasMore={false}
        isLoadingMore={false}
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
        hasMore={false}
        isLoadingMore={false}
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
    queryStateMocks.sortOrder = "asc"

    render(
      <PatientsTable
        patients={patients}
        isLoading={false}
        hasMore={false}
        isLoadingMore={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDetails={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /nome/i }))

    expect(queryStateMocks.setSortOrder).toHaveBeenCalledWith("desc")
  })

  it("should configure infinite scroll when there are more patients to load", () => {
    const onLoadMore = vi.fn()

    render(
      <PatientsTable
        patients={patients}
        isLoading={false}
        hasMore
        isLoadingMore={false}
        onLoadMore={onLoadMore}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDetails={vi.fn()}
      />,
    )

    expect(infiniteScrollMocks.useInfiniteScroll).toHaveBeenCalled()
    expect(screen.getByTestId("patients-load-more-trigger").textContent).toContain("Role para carregar mais pacientes")
  })

  it("should show the loading-more state while fetching the next page", () => {
    render(
      <PatientsTable
        patients={patients}
        isLoading={false}
        hasMore
        isLoadingMore
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDetails={vi.fn()}
      />,
    )

    expect(screen.getByTestId("patients-load-more-trigger").textContent).toContain("Carregando mais pacientes...")
  })
})
