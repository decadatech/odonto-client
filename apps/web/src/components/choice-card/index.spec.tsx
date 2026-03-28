import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

import { ChoiceCard, type ChoiceCardOption } from "."

const ROLE_OPTIONS: ChoiceCardOption[] = [
  {
    value: "secretary",
    title: "Secretário(a)",
    description: "Permissão a todas as ações da aplicação.",
  },
  {
    value: "dentist",
    title: "Dentista",
    description: "Além de todas as permissões, poderá ser atribuído a atendimentos.",
  },
]

describe("ChoiceCard", () => {
  it("should render options and sync hidden input with provided value", () => {
    const { container } = render(
      <ChoiceCard
        name="role"
        value="secretary"
        options={ROLE_OPTIONS}
      />,
    )

    expect(screen.getByText("Secretário(a)")).toBeTruthy()
    expect(screen.getByText("Dentista")).toBeTruthy()
    expect(screen.getByText("Permissão a todas as ações da aplicação.")).toBeTruthy()

    const hiddenInput = container.querySelector('input[type="hidden"][name="role"]') as HTMLInputElement | null

    expect(hiddenInput?.value).toBe("secretary")

    const secretaryRadio = container.querySelector("#role-secretary")
    const dentistRadio = container.querySelector("#role-dentist")

    expect(secretaryRadio?.getAttribute("data-state")).toBe("checked")
    expect(dentistRadio?.getAttribute("data-state")).toBe("unchecked")
  })

  it("should call onValueChange but keep current selection until parent updates the value", () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <ChoiceCard
        name="role"
        value="secretary"
        onValueChange={onValueChange}
        options={ROLE_OPTIONS}
      />,
    )

    const dentistRadio = container.querySelector("#role-dentist")

    fireEvent.click(dentistRadio as Element)

    expect(onValueChange).toHaveBeenCalledWith("dentist")
    expect(container.querySelector("#role-secretary")?.getAttribute("data-state")).toBe("checked")
    expect(container.querySelector("#role-dentist")?.getAttribute("data-state")).toBe("unchecked")
    expect(
      (container.querySelector('input[type="hidden"][name="role"]') as HTMLInputElement | null)?.value,
    ).toBe("secretary")
  })

  it("should reflect selection changes when parent updates the controlled value", () => {
    function ControlledChoiceCard() {
      const [value, setValue] = React.useState("secretary")

      return (
        <ChoiceCard
          name="role"
          value={value}
          onValueChange={setValue}
          options={ROLE_OPTIONS}
        />
      )
    }

    const { container } = render(<ControlledChoiceCard />)

    fireEvent.click(container.querySelector("#role-dentist") as Element)

    expect(container.querySelector("#role-secretary")?.getAttribute("data-state")).toBe("unchecked")
    expect(container.querySelector("#role-dentist")?.getAttribute("data-state")).toBe("checked")
    expect(
      (container.querySelector('input[type="hidden"][name="role"]') as HTMLInputElement | null)?.value,
    ).toBe("dentist")
  })
})
