import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

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

describe("BirthDatePicker", () => {
  it("should render placeholder and empty hidden input when there is no initial value", () => {
    const { container } = render(
      <BirthDatePicker
        id="birthDate"
        name="birthDate"
        required
      />,
    )

    expect(screen.getByText("Selecione a data")).toBeTruthy()

    const hiddenInput = container.querySelector('input[type="hidden"][name="birthDate"]') as HTMLInputElement | null

    expect(hiddenInput?.value).toBe("")
    expect(hiddenInput?.required).toBe(true)
    expect(screen.getByRole("button", { name: "Selecionar data" }).getAttribute("data-future-disabled")).toBe("true")
  })

  it("should sync the hidden input when an initial value is provided", () => {
    const { container } = render(
      <BirthDatePicker
        id="birthDate"
        name="birthDate"
        value="1990-05-12"
      />,
    )

    const hiddenInput = container.querySelector('input[type="hidden"][name="birthDate"]') as HTMLInputElement | null

    expect(hiddenInput?.value).toBe("1990-05-12")
    expect(screen.queryByText("Selecione a data")).toBeNull()
    expect(screen.getByRole("button", { name: "Selecionar data" }).getAttribute("data-selected")).toBe("1990-05-12")
  })

  it("should update the selected date and call onValueChange when a new date is selected", () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <BirthDatePicker
        id="birthDate"
        name="birthDate"
        onValueChange={onValueChange}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Selecionar data" }))

    const hiddenInput = container.querySelector('input[type="hidden"][name="birthDate"]') as HTMLInputElement | null

    expect(hiddenInput?.value).toBe("2001-02-03")
    expect(onValueChange).toHaveBeenCalledWith("2001-02-03")
  })
})
