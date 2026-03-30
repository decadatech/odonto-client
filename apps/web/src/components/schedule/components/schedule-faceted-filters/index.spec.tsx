import * as React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"

import { ScheduleFacetedFilters } from "@/components/schedule/components/schedule-faceted-filters"

const mockUsePatientsQuery = vi.fn()
const mockUseScheduleFiltersQueryState = vi.fn()

vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}))

vi.mock("@/hooks/queries/patients", () => ({
  usePatientsQuery: (options: unknown) => mockUsePatientsQuery(options),
}))

vi.mock("./hooks/use-schedule-filters-query-state", () => ({
  useScheduleFiltersQueryState: () => mockUseScheduleFiltersQueryState(),
}))

vi.mock("@/components/facet-filter", () => ({
  FacetFilter: ({
    title,
    options,
    allOptions,
    selectedValues,
    onToggle,
    onReset,
    searchValue,
    onSearchChange,
    isLoading,
    loadingMessage,
  }: {
    title: string
    options: Array<{ value: string, label: string }>
    allOptions?: Array<{ value: string, label: string }>
    selectedValues: string[]
    onToggle: (value: string) => void
    onReset: () => void
    searchValue?: string
    onSearchChange?: (value: string) => void
    isLoading?: boolean
    loadingMessage?: string
  }) => (
    <section data-testid={`facet-${title}`}>
      <h2>{title}</h2>
      <div data-testid={`selected-${title}`}>{selectedValues.join(",")}</div>
      <div data-testid={`search-${title}`}>{searchValue ?? ""}</div>
      <div data-testid={`loading-${title}`}>{String(Boolean(isLoading))}</div>
      <div data-testid={`loading-message-${title}`}>{loadingMessage ?? ""}</div>
      <ul data-testid={`options-${title}`}>
        {options.map((option) => (
          <li key={option.value}>{option.label}</li>
        ))}
      </ul>
      <ul data-testid={`all-options-${title}`}>
        {(allOptions ?? []).map((option) => (
          <li key={option.value}>{option.label}</li>
        ))}
      </ul>
      <button type="button" onClick={() => onToggle(options[0]?.value ?? "fallback")}>
        Toggle {title}
      </button>
      <button type="button" onClick={onReset}>
        Reset {title}
      </button>
      {typeof onSearchChange === "function" ? (
        <button type="button" onClick={() => onSearchChange("maria")}>
          Search {title}
        </button>
      ) : null}
    </section>
  ),
}))

describe("ScheduleFacetedFilters", () => {
  const dentistOptions = [
    { value: "dentist-1", label: "Dra. Ana Lima" },
    { value: "dentist-2", label: "Dr. Bruno Castro" },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseScheduleFiltersQueryState.mockReturnValue({
      resetAll: vi.fn(),
      resetFacet: vi.fn(),
      selectedValues: {
        dentists: [],
        patients: [],
        statuses: [],
      },
      toggleOption: vi.fn(),
    })

    mockUsePatientsQuery.mockReturnValue({
      data: {
        items: [],
        nextCursor: null,
      },
      isPending: false,
      isFetching: false,
    })
  })

  it("should render the three facets and keep reset disabled with no active filters", () => {
    render(<ScheduleFacetedFilters dentists={dentistOptions} />)

    expect(screen.getByTestId("facet-Dentistas")).toBeTruthy()
    expect(screen.getByTestId("facet-Pacientes")).toBeTruthy()
    expect(screen.getByTestId("facet-Status")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Redefinir filtros" }).getAttribute("disabled")).not.toBeNull()
  })

  it("should request patients with limit 5 and map the returned options", () => {
    mockUsePatientsQuery.mockReturnValue({
      data: {
        items: [
          {
            id: "patient-1",
            nome: "Maria Souza",
            rg: "123",
            telefone: "11999999999",
            email: "maria@example.com",
          },
          {
            id: "patient-2",
            nome: "João Pedro",
            rg: "456",
            telefone: "11888888888",
            email: "joao@example.com",
          },
        ],
        nextCursor: null,
      },
      isPending: false,
      isFetching: true,
    })

    render(<ScheduleFacetedFilters dentists={dentistOptions} />)

    expect(mockUsePatientsQuery).toHaveBeenCalledWith({
      search: "",
      limit: 5,
    })

    const patientFacet = screen.getByTestId("facet-Pacientes")
    const options = within(patientFacet).getByTestId("options-Pacientes")

    expect(options.textContent).toContain("Maria Souza")
    expect(options.textContent).toContain("João Pedro")
    expect(within(patientFacet).getByTestId("loading-Pacientes").textContent).toBe("true")
    expect(within(patientFacet).getByTestId("loading-message-Pacientes").textContent).toBe("Buscando pacientes...")
  })

  it("should forward toggles and resets to the query-state hook", () => {
    const toggleOption = vi.fn()
    const resetFacet = vi.fn()

    mockUseScheduleFiltersQueryState.mockReturnValue({
      resetAll: vi.fn(),
      resetFacet,
      selectedValues: {
        dentists: ["dentist-1"],
        patients: ["patient-1"],
        statuses: ["confirmed"],
      },
      toggleOption,
    })

    render(<ScheduleFacetedFilters dentists={dentistOptions} />)

    fireEvent.click(screen.getByRole("button", { name: "Toggle Dentistas" }))
    fireEvent.click(screen.getByRole("button", { name: "Toggle Pacientes" }))
    fireEvent.click(screen.getByRole("button", { name: "Toggle Status" }))
    fireEvent.click(screen.getByRole("button", { name: "Reset Dentistas" }))
    fireEvent.click(screen.getByRole("button", { name: "Reset Pacientes" }))
    fireEvent.click(screen.getByRole("button", { name: "Reset Status" }))

    expect(toggleOption).toHaveBeenCalledWith("dentists", "dentist-1")
    expect(toggleOption).toHaveBeenCalledWith("patients", "fallback")
    expect(toggleOption).toHaveBeenCalledWith("statuses", "scheduled")
    expect(resetFacet).toHaveBeenCalledWith("dentists")
    expect(resetFacet).toHaveBeenCalledWith("patients")
    expect(resetFacet).toHaveBeenCalledWith("statuses")
  })

  it("should keep patient search local, update the request and clear it on resets", () => {
    const resetAll = vi.fn()
    const resetFacet = vi.fn()

    mockUseScheduleFiltersQueryState.mockReturnValue({
      resetAll,
      resetFacet,
      selectedValues: {
        dentists: [],
        patients: [],
        statuses: [],
      },
      toggleOption: vi.fn(),
    })

    render(<ScheduleFacetedFilters dentists={dentistOptions} />)

    expect(mockUsePatientsQuery).toHaveBeenLastCalledWith({
      search: "",
      limit: 5,
    })

    fireEvent.click(screen.getByRole("button", { name: "Search Pacientes" }))

    expect(mockUsePatientsQuery).toHaveBeenLastCalledWith({
      search: "maria",
      limit: 5,
    })
    expect(screen.getByTestId("search-Pacientes").textContent).toBe("maria")

    fireEvent.click(screen.getByRole("button", { name: "Reset Pacientes" }))

    expect(resetFacet).toHaveBeenCalledWith("patients")
    expect(screen.getByTestId("search-Pacientes").textContent).toBe("")
    expect(mockUsePatientsQuery).toHaveBeenLastCalledWith({
      search: "",
      limit: 5,
    })

    fireEvent.click(screen.getByRole("button", { name: "Search Pacientes" }))
    fireEvent.click(screen.getByRole("button", { name: "Redefinir filtros" }))

    expect(resetAll).toHaveBeenCalled()
    expect(screen.getByTestId("search-Pacientes").textContent).toBe("")
  })

  it("should keep known patient options so selected labels remain available", () => {
    mockUseScheduleFiltersQueryState.mockReturnValue({
      resetAll: vi.fn(),
      resetFacet: vi.fn(),
      selectedValues: {
        dentists: [],
        patients: ["patient-1"],
        statuses: [],
      },
      toggleOption: vi.fn(),
    })

    const { rerender } = render(<ScheduleFacetedFilters dentists={dentistOptions} />)

    mockUsePatientsQuery.mockReturnValue({
      data: {
        items: [
          {
            id: "patient-1",
            nome: "Maria Souza",
            rg: "123",
            telefone: "11999999999",
            email: "maria@example.com",
          },
        ],
        nextCursor: null,
      },
      isPending: false,
      isFetching: false,
    })

    rerender(<ScheduleFacetedFilters dentists={dentistOptions} />)

    mockUsePatientsQuery.mockReturnValue({
      data: {
        items: [],
        nextCursor: null,
      },
      isPending: false,
      isFetching: false,
    })

    rerender(<ScheduleFacetedFilters dentists={dentistOptions} />)

    const allOptions = screen.getByTestId("all-options-Pacientes")
    expect(allOptions.textContent).toContain("Maria Souza")
  })
})
