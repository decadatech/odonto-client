import * as React from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ChoiceCard, type ChoiceCardOption } from "@/components/choice-card"

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

describe("ChoiceCard", () => {
  it("should render options and sync hidden input with provided value", () => {
    render(
      <ChoiceCard
        name="role"
        value="secretary"
        options={ROLE_OPTIONS}
      />,
    )

    expect(document.body.textContent).toContain("Secretário(a)")
    expect(document.body.textContent).toContain("Dentista")
    expect(document.body.textContent).toContain("Permissão a todas as ações da aplicação.")

    const hiddenInput = document.querySelector('input[type="hidden"][name="role"]') as HTMLInputElement | null

    expect(hiddenInput?.value).toBe("secretary")

    const secretaryRadio = document.getElementById("role-secretary")
    const dentistRadio = document.getElementById("role-dentist")

    expect(secretaryRadio?.getAttribute("data-state")).toBe("checked")
    expect(dentistRadio?.getAttribute("data-state")).toBe("unchecked")
  })

  it("should call onValueChange but keep current selection until parent updates the value", () => {
    const onValueChange = vi.fn()

    render(
      <ChoiceCard
        name="role"
        value="secretary"
        onValueChange={onValueChange}
        options={ROLE_OPTIONS}
      />,
    )

    const dentistRadio = document.getElementById("role-dentist")

    act(() => {
      dentistRadio?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onValueChange).toHaveBeenCalledWith("dentist")
    expect(document.getElementById("role-secretary")?.getAttribute("data-state")).toBe("checked")
    expect(document.getElementById("role-dentist")?.getAttribute("data-state")).toBe("unchecked")
    expect(
      (document.querySelector('input[type="hidden"][name="role"]') as HTMLInputElement | null)?.value,
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

    render(<ControlledChoiceCard />)

    const dentistRadio = document.getElementById("role-dentist")

    act(() => {
      dentistRadio?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(document.getElementById("role-secretary")?.getAttribute("data-state")).toBe("unchecked")
    expect(document.getElementById("role-dentist")?.getAttribute("data-state")).toBe("checked")
    expect(
      (document.querySelector('input[type="hidden"][name="role"]') as HTMLInputElement | null)?.value,
    ).toBe("dentist")
  })
})
