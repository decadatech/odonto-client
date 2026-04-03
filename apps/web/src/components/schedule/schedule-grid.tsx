"use client"

import { addMinutes, differenceInMinutes, format, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createRef, useMemo, useRef } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { DraggableScheduleEvent } from "@/components/schedule/draggable-schedule-event"
import type { ScheduleAppointment, ScheduleAppointmentDraft } from "@/components/schedule/types"
import { ScheduleEventCard } from "@/components/schedule/schedule-event-card"
import { getAppointmentsForDay, toDate } from "@/components/schedule/utils"

interface ScheduleGridProps {
  days: Date[]
  appointments: ScheduleAppointment[]
  timeSlots: Date[]
  startHour: number
  endHour: number
  intervalMinutes: number
  onCreateAppointment?: (draft: ScheduleAppointmentDraft) => void
  onAppointmentClick?: (appointment: ScheduleAppointment) => void
  onAppointmentMove?: (appointmentId: string, start: Date, end: Date) => void
}

const SLOT_HEIGHT = 56
const SNAP_MINUTES = 15
const MIN_DURATION_MINUTES = 15

export function ScheduleGrid({
  days,
  appointments,
  timeSlots,
  startHour,
  endHour,
  intervalMinutes,
  onCreateAppointment,
  onAppointmentClick,
  onAppointmentMove,
}: ScheduleGridProps) {
  const lastInteractionAtRef = useRef(0)
  const suppressNextEmptyClickRef = useRef(false)
  const dayColumns = days.length
  const minutesPerPixel = intervalMinutes / SLOT_HEIGHT
  const pixelsPerMinute = SLOT_HEIGHT / intervalMinutes
  const snapHeight = SNAP_MINUTES * pixelsPerMinute
  const minimumHeight = MIN_DURATION_MINUTES * pixelsPerMinute
  const gridHeight = timeSlots.length * SLOT_HEIGHT
  const dayColumnRefs = useMemo(
    () => days.map(() => createRef<HTMLDivElement>()),
    [days],
  )

  return (
    <div className="overflow-auto">
      <div
        className="grid"
        style={{
          minWidth: dayColumns === 1 ? 380 : 980,
          gridTemplateColumns: `80px repeat(${dayColumns}, minmax(0, 1fr))`,
        }}
      >
        <div className="border-r border-b bg-muted/30" />
        {days.map((day) => (
          <div key={day.toISOString()} className="border-b p-2 text-center">
            <p className="text-xs text-muted-foreground">{format(day, "EEE", { locale: ptBR })}</p>
            <p className="text-sm font-semibold">{format(day, "dd/MM")}</p>
          </div>
        ))}

        <div className="border-r">
          {timeSlots.map((slot) => (
            <div
              key={slot.toISOString()}
              className="border-b px-2 pt-1 text-right text-xs text-muted-foreground"
              style={{ height: SLOT_HEIGHT }}
            >
              {format(slot, "HH:mm")}
            </div>
          ))}
        </div>

        {days.map((day) => {
          const dayAppointments = getAppointmentsForDay(appointments, day).sort((left, right) => {
            const leftStart = toDate(left.start)
            const leftEnd = toDate(left.end)
            const rightStart = toDate(right.start)
            const rightEnd = toDate(right.end)

            const leftDuration = differenceInMinutes(leftEnd, leftStart)
            const rightDuration = differenceInMinutes(rightEnd, rightStart)

            if (leftDuration !== rightDuration) {
              return rightDuration - leftDuration
            }

            return leftStart.getTime() - rightStart.getTime()
          })
          const dayIndex = days.findIndex((currentDay) => currentDay.toISOString() === day.toISOString())

          return (
            <div
              key={day.toISOString()}
              ref={dayColumnRefs[dayIndex]}
              className="relative overflow-hidden border-r last:border-r-0"
              onClick={(event) => {
                if (!onCreateAppointment) {
                  return
                }

                if (suppressNextEmptyClickRef.current) {
                  suppressNextEmptyClickRef.current = false
                  return
                }

                if (Date.now() - lastInteractionAtRef.current < 500) {
                  return
                }

                const target = event.target as HTMLElement

                if (target.closest("[data-schedule-event]")) {
                  return
                }

                const rect = event.currentTarget.getBoundingClientRect()
                const clickY = event.clientY - rect.top
                const snappedY = Math.max(
                  0,
                  Math.round(clickY / snapHeight) * snapHeight,
                )
                const maximumStartMinutes = Math.max((endHour - startHour) * 60 - 30, 0)

                const draftStart = startOfDay(day)
                draftStart.setHours(startHour, 0, 0, 0)

                const start = addMinutes(
                  draftStart,
                  Math.min(snappedY / pixelsPerMinute, maximumStartMinutes),
                )
                const end = addMinutes(start, 30)

                onCreateAppointment({ start, end })
              }}
            >
              {timeSlots.map((slot) => (
                <div key={slot.toISOString()} className="border-b" style={{ height: SLOT_HEIGHT }} />
              ))}

              {dayAppointments.map((appointment, appointmentIndex) => {
                const start = toDate(appointment.start)
                const end = toDate(appointment.end)

                const dayStart = startOfDay(day)
                dayStart.setHours(startHour, 0, 0, 0)

                const offsetMinutes = differenceInMinutes(start, dayStart)
                const durationMinutes = Math.max(differenceInMinutes(end, start), 30)

                const top = offsetMinutes / minutesPerPixel
                const height = durationMinutes / minutesPerPixel

                return (
                  <DraggableScheduleEvent
                    key={appointment.id}
                    appointment={appointment}
                    baseTop={top}
                    baseHeight={height}
                    zIndex={appointmentIndex + 1}
                    dayIndex={dayIndex}
                    days={days}
                    dayColumnRefs={dayColumnRefs}
                    gridHeight={gridHeight}
                    startHour={startHour}
                    pixelsPerMinute={pixelsPerMinute}
                    snapHeight={snapHeight}
                    minimumHeight={minimumHeight}
                    onAppointmentClick={onAppointmentClick}
                    onAppointmentMove={onAppointmentMove}
                    onInteractionEnd={() => {
                      lastInteractionAtRef.current = Date.now()
                      suppressNextEmptyClickRef.current = true
                    }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      {appointments.length === 0 ? (
        <div className={cn("py-10 text-center text-sm text-muted-foreground")}>Nenhum agendamento para este período.</div>
      ) : null}
    </div>
  )
}
