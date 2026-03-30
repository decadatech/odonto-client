"use client"

import { CalendarPlus, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { ScheduleView } from "@/components/schedule/types"

const VIEW_LABELS: Record<ScheduleView, string> = {
  month: "Mês",
  week: "Semana",
  day: "Dia",
}

interface ScheduleHeaderProps {
  title: string
  subtitle: string
  view: ScheduleView
  isTodayDisabled?: boolean
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: ScheduleView) => void
  onCreateAppointment?: () => void
}

export function ScheduleHeader({
  title,
  subtitle,
  view,
  isTodayDisabled = false,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  onCreateAppointment,
}: ScheduleHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
      <div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          onClick={onPrevious}
          aria-label="Período anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          onClick={onNext}
          aria-label="Próximo período"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 px-3"
          onClick={onToday}
          disabled={isTodayDisabled}
        >
          Hoje
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="h-9 gap-1.5">
              {VIEW_LABELS[view]}
              <ChevronDown className="size-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuCheckboxItem checked={view === "month"} onCheckedChange={() => onViewChange("month")}>
              Mês
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={view === "week"} onCheckedChange={() => onViewChange("week")}>
              Semana
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={view === "day"} onCheckedChange={() => onViewChange("day")}>
              Dia
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onCreateAppointment}>
          <CalendarPlus className="size-4" />
          Criar um agendamento
        </Button>
      </div>
    </div>
  )
}
