import * as React from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"

import { BirthDatePicker } from "."

vi.mock("@workspace/ui/components/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@workspace/ui/components/calendar", () => ({
  Calendar: ({
    selected,
    onSelect,
    disabled,
  }: {
    selected?: Date
    onSelect?: (date?: Date) => void
    disabled?: (date: Date) => boolean
  }) => (
    <div>
      <button
        id="calendar-select-date"
        type="button"
        data-selected={selected ? selected.toISOString().slice(0, 10) : ""}
        data-future-disabled={disabled ? String(disabled(new Date("2999-01-01T00:00:00"))) : "false"}
        onClick={() => onSelect?.(new Date("2001-02-03T00:00:00"))}
      >
        Selecionar data
      </button>
    </div>
  ),
}))

let container: HTMLDivElement | null = null
let root: Root | null = null

function render(element: React.ReactNode) {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)

  act(() => {
    root?.render(element)
  })
}

afterEach(() => {
  act(() => {
    root?.unmount()
  })

  container?.remove()
  container = null
  root = null
})

describe("BirthDatePicker", () => {
  it("should render placeholder and empty hidden input when there is no initial value", () => {
    render(
      <BirthDatePicker
        id="birthDate"
        name="birthDate"
        required
      />,
    )

    expect(document.body.textContent).toContain("Selecione a data")

    const hiddenInput = document.querySelector('input[type="hidden"][name="birthDate"]') as HTMLInputElement | null

    expect(hiddenInput?.value).toBe("")
    expect(hiddenInput?.required).toBe(true)
    expect(document.getElementById("calendar-select-date")?.getAttribute("data-future-disabled")).toBe("true")
  })

  it("should sync the hidden input when an initial value is provided", () => {
    render(
      <BirthDatePicker
        id="birthDate"
        name="birthDate"
        value="1990-05-12"
      />,
    )

    const hiddenInput = document.querySelector('input[type="hidden"][name="birthDate"]') as HTMLInputElement | null

    expect(hiddenInput?.value).toBe("1990-05-12")
    expect(document.body.textContent).not.toContain("Selecione a data")
    expect(document.getElementById("calendar-select-date")?.getAttribute("data-selected")).toBe("1990-05-12")
  })

  it("should update the selected date and call onValueChange when a new date is selected", () => {
    const onValueChange = vi.fn()

    render(
      <BirthDatePicker
        id="birthDate"
        name="birthDate"
        onValueChange={onValueChange}
      />,
    )

    act(() => {
      document.getElementById("calendar-select-date")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      )
    })

    const hiddenInput = document.querySelector('input[type="hidden"][name="birthDate"]') as HTMLInputElement | null

    expect(hiddenInput?.value).toBe("2001-02-03")
    expect(onValueChange).toHaveBeenCalledWith("2001-02-03")
  })
})
