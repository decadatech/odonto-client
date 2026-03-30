import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

import { ScheduleHeader } from "@/components/schedule/components/schedule-header"

vi.mock("@workspace/ui/components/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="view-menu">{children}</div>
  ),
  DropdownMenuCheckboxItem: ({
    children,
    checked,
    onCheckedChange,
  }: {
    children: React.ReactNode
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
  }) => (
    <button
      type="button"
      aria-pressed={checked}
      data-testid={`view-option-${String(children)}`}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {children}
    </button>
  ),
}))

describe("ScheduleHeader", () => {
  function renderComponent(overrides: Partial<React.ComponentProps<typeof ScheduleHeader>> = {}) {
    const props: React.ComponentProps<typeof ScheduleHeader> = {
      title: "Março de 2026",
      subtitle: "Agenda clínica",
      view: "week",
      isTodayDisabled: false,
      onPrevious: vi.fn(),
      onNext: vi.fn(),
      onToday: vi.fn(),
      onViewChange: vi.fn(),
      onCreateAppointment: vi.fn(),
      ...overrides,
    }

    render(<ScheduleHeader {...props} />)

    return props
  }

  it("should render title, subtitle and current view label", () => {
    renderComponent()

    expect(screen.getByText("Agenda clínica")).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Março de 2026" })).toBeTruthy()
    expect(screen.getAllByRole("button", { name: /Semana/i }).length).toBeGreaterThan(0)
  })

  it("should call previous, next and today actions", () => {
    const props = renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "Período anterior" }))
    fireEvent.click(screen.getByRole("button", { name: "Próximo período" }))
    fireEvent.click(screen.getByRole("button", { name: "Hoje" }))

    expect(props.onPrevious).toHaveBeenCalledTimes(1)
    expect(props.onNext).toHaveBeenCalledTimes(1)
    expect(props.onToday).toHaveBeenCalledTimes(1)
  })

  it("should disable the today button when requested", () => {
    renderComponent({
      isTodayDisabled: true,
    })

    expect(screen.getByRole("button", { name: "Hoje" }).getAttribute("disabled")).not.toBeNull()
  })

  it("should call onViewChange for each available view", () => {
    const props = renderComponent({
      view: "month",
    })

    fireEvent.click(screen.getByTestId("view-option-Mês"))
    fireEvent.click(screen.getByTestId("view-option-Semana"))
    fireEvent.click(screen.getByTestId("view-option-Dia"))

    expect(props.onViewChange).toHaveBeenCalledWith("month")
    expect(props.onViewChange).toHaveBeenCalledWith("week")
    expect(props.onViewChange).toHaveBeenCalledWith("day")
  })

  it("should call onCreateAppointment when clicking the create button", () => {
    const props = renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "Criar um agendamento" }))

    expect(props.onCreateAppointment).toHaveBeenCalledTimes(1)
  })
})
