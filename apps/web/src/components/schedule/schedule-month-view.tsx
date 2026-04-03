"use client"

import { addMinutes, format, isSameDay, isSameMonth, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import type { ScheduleAppointment, ScheduleAppointmentDraft } from "@/components/schedule/types"
import { toDate } from "@/components/schedule/utils"

interface ScheduleMonthViewProps {
  days: Date[]
  referenceDate: Date
  appointments: ScheduleAppointment[]
  onCreateAppointment?: (draft: ScheduleAppointmentDraft) => void
  onAppointmentClick?: (appointment: ScheduleAppointment) => void
}

export function ScheduleMonthView({
  days,
  referenceDate,
  appointments,
  onCreateAppointment,
  onAppointmentClick,
}: ScheduleMonthViewProps) {
  return (
    <div className="overflow-auto">
        <div className="grid min-w-[980px] grid-cols-7">
          {days.slice(0, 7).map((day) => (
            <div key={`header-${day.toISOString()}`} className="border-b p-2 text-center text-xs font-medium text-muted-foreground">
            {format(day, "EEE", { locale: ptBR })}
            </div>
          ))}

        {days.map((day) => {
          const dayAppointments = appointments
            .filter((appointment) => isSameDay(toDate(appointment.start), day))
            .sort((left, right) => toDate(left.start).getTime() - toDate(right.start).getTime())

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-36 border-r border-b p-2 last:border-r-0",
                !isSameMonth(day, referenceDate) && "bg-muted/20",
              )}
              onClick={(event) => {
                if (!onCreateAppointment) {
                  return
                }

                const target = event.target as HTMLElement

                if (target.closest("[data-schedule-event]")) {
                  return
                }

                const start = new Date(day)
                start.setHours(9, 0, 0, 0)

                onCreateAppointment({
                  start,
                  end: addMinutes(start, 30),
                })
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-sm font-medium text-foreground",
                    !isSameMonth(day, referenceDate) && "text-muted-foreground",
                    isToday(day) && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>

                {dayAppointments.length > 0 ? (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {dayAppointments.length}
                  </Badge>
                ) : null}
              </div>

              <div className="space-y-1">
                {dayAppointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    data-schedule-event=""
                    onClick={() => onAppointmentClick?.(appointment)}
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-md border px-1.5 py-1 text-left text-[11px] shadow-sm transition hover:bg-accent/60",
                      appointment.color === "teal" && "border-teal-200 bg-teal-50",
                      appointment.color === "amber" && "border-amber-200 bg-amber-50",
                      appointment.color === "rose" && "border-rose-200 bg-rose-50",
                      appointment.color === "violet" && "border-violet-200 bg-violet-50",
                      (!appointment.color || appointment.color === "sky") && "border-sky-200 bg-sky-50",
                    )}
                    >
                    <span
                      className={cn(
                        "h-5 w-1 shrink-0 rounded-full",
                        appointment.color === "teal" && "bg-teal-500/70",
                        appointment.color === "amber" && "bg-amber-500/70",
                        appointment.color === "rose" && "bg-rose-500/70",
                        appointment.color === "violet" && "bg-violet-500/70",
                        (!appointment.color || appointment.color === "sky") && "bg-sky-500/70",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-medium text-foreground">
                        {format(toDate(appointment.start), "HH:mm")} {appointment.title}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
