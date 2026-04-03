"use client"

import { useEffect, useState } from "react"
import { differenceInMinutes, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Badge } from "@workspace/ui/components/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card"
import { cn } from "@workspace/ui/lib/utils"

import type { ScheduleAppointment } from "@/components/schedule/types"
import { toDate } from "@/components/schedule/utils"

interface ScheduleEventCardProps {
  appointment: ScheduleAppointment
  onClick?: (appointment: ScheduleAppointment) => void
  style?: React.CSSProperties
  onPointerDownCapture?: React.PointerEventHandler<HTMLButtonElement>
  onPointerUpCapture?: React.PointerEventHandler<HTMLButtonElement>
  onPointerCancelCapture?: React.PointerEventHandler<HTMLButtonElement>
  isDragging?: boolean
  isResizing?: boolean
  isPreview?: boolean
  isInteracting?: boolean
  className?: string
  children?: React.ReactNode
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
}

function formatDateLabel(date: Date) {
  const formatted = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const APPOINTMENT_COLOR_STYLES: Record<
  NonNullable<ScheduleAppointment["color"]>,
  {
    container: string
    accent: string
    ring: string
  }
> = {
  teal: {
    container: "border-teal-200/90 bg-teal-50/95 hover:border-teal-300 hover:bg-teal-100/95",
    accent: "bg-teal-500/70",
    ring: "ring-teal-300",
  },
  amber: {
    container: "border-amber-200/90 bg-amber-50/95 hover:border-amber-300 hover:bg-amber-100/95",
    accent: "bg-amber-500/70",
    ring: "ring-amber-300",
  },
  rose: {
    container: "border-rose-200/90 bg-rose-50/95 hover:border-rose-300 hover:bg-rose-100/95",
    accent: "bg-rose-500/70",
    ring: "ring-rose-300",
  },
  violet: {
    container: "border-violet-200/90 bg-violet-50/95 hover:border-violet-300 hover:bg-violet-100/95",
    accent: "bg-violet-500/70",
    ring: "ring-violet-300",
  },
  sky: {
    container: "border-sky-200/90 bg-sky-50/95 hover:border-sky-300 hover:bg-sky-100/95",
    accent: "bg-sky-500/70",
    ring: "ring-sky-300",
  },
}

export function ScheduleEventCard({
  appointment,
  onClick,
  style,
  onPointerDownCapture,
  onPointerUpCapture,
  onPointerCancelCapture,
  isDragging = false,
  isResizing = false,
  isPreview = false,
  isInteracting = false,
  className,
  children,
}: ScheduleEventCardProps) {
  const start = toDate(appointment.start)
  const end = toDate(appointment.end)
  const durationMinutes = differenceInMinutes(end, start)
  const colorStyles = APPOINTMENT_COLOR_STYLES[appointment.color ?? "sky"]
  const [isHoverOpen, setIsHoverOpen] = useState(false)

  useEffect(() => {
    if (isDragging || isResizing || isInteracting) {
      setIsHoverOpen(false)
    }
  }, [isDragging, isInteracting, isResizing])

  const eventButton = (
    <button
      type="button"
      data-schedule-event=""
      onClick={() => onClick?.(appointment)}
      onPointerDownCapture={onPointerDownCapture}
      onPointerUpCapture={onPointerUpCapture}
      onPointerCancelCapture={onPointerCancelCapture}
      className={cn(
        "group relative h-full w-full overflow-hidden rounded-md border px-2 py-1 text-left shadow-sm ring-1 ring-white/80 backdrop-blur-sm transition outline-none select-none",
        colorStyles.container,
        appointment.status === "cancelled" && "border-zinc-300 bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
        (isResizing || isPreview) && cn("z-20 shadow-md ring-2", colorStyles.ring),
        className,
      )}
      style={style}
    >
      {children}

      <div className={cn("pointer-events-none absolute inset-y-1 left-1 w-1 rounded-full", colorStyles.accent)} />

      <div className="pointer-events-none relative flex h-full min-w-0 flex-col gap-y-1 pl-3">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <p className="line-clamp-1 text-xs font-semibold text-zinc-900">{appointment.title}</p>
          {appointment.status ? (
            <Badge variant="secondary" className="h-5 shrink-0 text-[10px]">
              {STATUS_LABEL[appointment.status] ?? appointment.status}
            </Badge>
          ) : null}
        </div>

        {durationMinutes > 30 ? (
          <p className="text-[11px] text-zinc-600">
            {format(start, "HH:mm")} - {format(end, "HH:mm")}
          </p>
        ) : null}

        {appointment.patientName ? (
          <p className="line-clamp-1 text-[11px] text-zinc-700">Paciente: {appointment.patientName}</p>
        ) : null}

        {appointment.dentistName ? (
          <p className="line-clamp-1 text-[11px] text-zinc-700">Dentista: {appointment.dentistName}</p>
        ) : null}
      </div>
    </button>
  )

  if (isPreview) {
    return eventButton
  }

  return (
    <HoverCard
      open={isDragging || isResizing || isInteracting ? false : isHoverOpen}
      onOpenChange={(nextOpen) => {
        if (isDragging || isResizing || isInteracting) {
          return
        }

        setIsHoverOpen(nextOpen)
      }}
      openDelay={500}
      closeDelay={0}
    >
      <HoverCardTrigger asChild>{eventButton}</HoverCardTrigger>
      <HoverCardContent align="start" side="top" className="w-72 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{appointment.title}</p>
          {appointment.status ? (
            <Badge variant="secondary" className="h-5 text-[10px]">
              {STATUS_LABEL[appointment.status]}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground">Data</p>
            <p>{formatDateLabel(start)}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground">Horário</p>
            <p>
              {format(start, "HH:mm")} - {format(end, "HH:mm")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground">Paciente</p>
            <p>{appointment.patientName ?? "Não informado"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground">Dentista</p>
            <p>{appointment.dentistName ?? "Não informado"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground">Status</p>
            <p>{appointment.status ? STATUS_LABEL[appointment.status] : "Não informado"}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
