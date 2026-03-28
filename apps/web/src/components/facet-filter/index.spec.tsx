import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

vi.mock("@workspace/ui/components/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { FacetFilter, type FacetFilterOption } from "@/components/facet-filter"

const STATIC_OPTIONS: FacetFilterOption[] = [
  { value: "ana-lima", label: "Dra. Ana Lima" },
  { value: "bruno-castro", label: "Dr. Bruno Castro" },
]

const PATIENT_OPTIONS: FacetFilterOption[] = [
  { value: "mariana-souza", label: "Mariana Souza" },
  { value: "joao-pedro", label: "João Pedro Alves" },
  { value: "laura-mendes", label: "Laura Mendes" },
]

function ControlledFacetFilter() {
  const [selectedValues, setSelectedValues] = React.useState<string[]>([])

  function handleToggle(value: string) {
    setSelectedValues((current) =>
      current.includes(value)
        ? current.filter((currentValue) => currentValue !== value)
        : [...current, value],
    )
  }

  return (
    <FacetFilter
      title="Dentistas"
      options={STATIC_OPTIONS}
      selectedValues={selectedValues}
      onToggle={handleToggle}
      onReset={() => setSelectedValues([])}
    />
  )
}

function SearchableFacetFilter({ isLoading = false }: { isLoading?: boolean }) {
  const [searchValue, setSearchValue] = React.useState("")
  const filteredOptions = PATIENT_OPTIONS.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  )

  return (
    <FacetFilter
      title="Pacientes"
      options={filteredOptions}
      allOptions={PATIENT_OPTIONS}
      selectedValues={[]}
      onToggle={vi.fn()}
      onReset={vi.fn()}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Buscar paciente..."
      emptyMessage="Nenhum paciente encontrado."
      isLoading={isLoading}
      loadingMessage="Buscando pacientes..."
    />
  )
}

describe("FacetFilter", () => {
  it("should render the empty state when there are no options", () => {
    render(
      <FacetFilter
        title="Pacientes"
        options={[]}
        selectedValues={[]}
        onToggle={vi.fn()}
        onReset={vi.fn()}
        emptyMessage="Nenhuma opção encontrada."
      />,
    )

    expect(screen.getByText("Nenhuma opção encontrada.")).toBeTruthy()
  })

  it("should render static options", () => {
    render(
      <FacetFilter
        title="Dentistas"
        options={STATIC_OPTIONS}
        selectedValues={[]}
        onToggle={vi.fn()}
        onReset={vi.fn()}
      />,
    )

    expect(screen.getByText("Dra. Ana Lima")).toBeTruthy()
    expect(screen.getByText("Dr. Bruno Castro")).toBeTruthy()
  })

  it("should render the loading state for dynamic options", () => {
    render(<SearchableFacetFilter isLoading />)

    expect(screen.getByText("Buscando pacientes...")).toBeTruthy()
    expect(screen.queryByText("Mariana Souza")).toBeNull()
    expect(screen.getByLabelText("Loading")).toBeTruthy()
  })

  it("should filter dynamic options by the typed name", () => {
    render(<SearchableFacetFilter />)

    fireEvent.change(screen.getByPlaceholderText("Buscar paciente..."), {
      target: { value: "mariana" },
    })

    expect(screen.getByText("Mariana Souza")).toBeTruthy()
    expect(screen.queryByText("João Pedro Alves")).toBeNull()
    expect(screen.queryByText("Laura Mendes")).toBeNull()
  })

  it("should update selection state and selected item count", () => {
    render(<ControlledFacetFilter />)

    fireEvent.click(screen.getByText("Dra. Ana Lima"))

    expect(screen.getByText("1 selecionado")).toBeTruthy()

    fireEvent.click(screen.getByText("Dr. Bruno Castro"))

    expect(screen.getByText("2 selecionados")).toBeTruthy()
  })

  it("should clear selected items when clicking the clear button", () => {
    render(<ControlledFacetFilter />)

    fireEvent.click(screen.getByText("Dra. Ana Lima"))
    fireEvent.click(screen.getByText("Dr. Bruno Castro"))

    expect(screen.getByText("2 selecionados")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }))

    expect(screen.getByText("0 selecionados")).toBeTruthy()
  })
})
