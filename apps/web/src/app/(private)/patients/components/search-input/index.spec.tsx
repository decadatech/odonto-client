import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { SearchInput } from "."

const paramsMocks = vi.hoisted(() => ({
  search: "",
  setSearch: vi.fn(),
}))

vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}))

vi.mock("../../hooks/use-patients-table-params", () => ({
  usePatientsTableParams: () => ({
    search: paramsMocks.search,
    setSearch: paramsMocks.setSearch,
  }),
}))

describe("SearchInput", () => {
  beforeEach(() => {
    paramsMocks.search = ""
    paramsMocks.setSearch.mockClear()
  })

  it("should render the initial search value from params", () => {
    paramsMocks.search = "maria"

    render(<SearchInput />)

    expect((screen.getByPlaceholderText("Pesquisar por nome do paciente...") as HTMLInputElement).value).toBe("maria")
  })

  it("should update the local input value and sync it through setSearch", () => {
    render(<SearchInput />)

    fireEvent.change(screen.getByPlaceholderText("Pesquisar por nome do paciente..."), {
      target: { value: "joao" },
    })

    expect((screen.getByPlaceholderText("Pesquisar por nome do paciente...") as HTMLInputElement).value).toBe("joao")
    expect(paramsMocks.setSearch).toHaveBeenCalledWith("joao")
  })

  it("should render the clear button only when there is a value and clear the search", () => {
    render(<SearchInput />)

    expect(screen.queryByRole("button")).toBeNull()

    fireEvent.change(screen.getByPlaceholderText("Pesquisar por nome do paciente..."), {
      target: { value: "ana" },
    })

    expect(screen.getByRole("button")).toBeTruthy()

    fireEvent.click(screen.getByRole("button"))

    expect((screen.getByPlaceholderText("Pesquisar por nome do paciente...") as HTMLInputElement).value).toBe("")
  })

  it("should sync an empty value after clearing the search", async () => {
    paramsMocks.search = "ana"

    render(<SearchInput />)

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(paramsMocks.setSearch).toHaveBeenLastCalledWith("")
    })
  })

  it("should reflect external search param updates", () => {
    const { rerender } = render(<SearchInput />)

    paramsMocks.search = "beatriz"
    rerender(<SearchInput />)

    expect((screen.getByPlaceholderText("Pesquisar por nome do paciente...") as HTMLInputElement).value).toBe("beatriz")
  })
})
