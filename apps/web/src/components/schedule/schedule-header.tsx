"use client"

import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

interface ScheduleHeaderProps {
  weekLabel: string
  onPreviousWeek: () => void
  onNextWeek: () => void
  onToday: () => void
  onCreateAppointment?: () => void
}

export function ScheduleHeader({
  weekLabel,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onCreateAppointment,
}: ScheduleHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
      <div className="flex items-center gap-3">
        <div className="w-[156px]">
          <p className="text-sm text-muted-foreground">Agenda semanal</p>
          <h2 className="text-lg font-semibold text-foreground">{weekLabel}</h2>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          onClick={onPreviousWeek}
          aria-label="Semana anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          onClick={onNextWeek}
          aria-label="Próxima semana"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button type="button" variant="outline" className="h-9 px-3" onClick={onToday}>
          Hoje
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button className="ml-auto" onClick={onCreateAppointment}>
          <CalendarPlus className="size-4" />
          Criar um agendamento
        </Button>
      </div>
    </div>
  )
}
