"use client"

import { useMemo, useState } from "react"
import { addWeeks, subWeeks } from "date-fns"

import { Card } from "@workspace/ui/components/card"

import { ScheduleGrid } from "@/components/schedule/schedule-grid"
import { ScheduleHeader } from "@/components/schedule/schedule-header"
import type { ScheduleProps } from "@/components/schedule/types"
import { buildTimeSlots, getWeekDays, getWeekLabel } from "@/components/schedule/utils"

export function Schedule({
  appointments,
  initialDate = new Date(),
  startHour = 7,
  endHour = 20,
  intervalMinutes = 60,
  onCreateAppointment,
  onAppointmentClick,
  onAppointmentMove,
}: ScheduleProps) {
  const [referenceDate, setReferenceDate] = useState(initialDate)

  const weekDays = useMemo(() => getWeekDays(referenceDate), [referenceDate])
  const weekLabel = useMemo(() => getWeekLabel(referenceDate), [referenceDate])
  const timeSlots = useMemo(() => buildTimeSlots(startHour, endHour, intervalMinutes), [startHour, endHour, intervalMinutes])

  return (
    <Card className="py-0 gap-0 rounded-xs overflow-hidden">
      <ScheduleHeader
        weekLabel={weekLabel}
        onToday={() => setReferenceDate(new Date())}
        onPreviousWeek={() => setReferenceDate((current) => subWeeks(current, 1))}
        onNextWeek={() => setReferenceDate((current) => addWeeks(current, 1))}
        onCreateAppointment={onCreateAppointment}
      />

      <ScheduleGrid
        days={weekDays}
        appointments={appointments}
        timeSlots={timeSlots}
        startHour={startHour}
        intervalMinutes={intervalMinutes}
        onAppointmentClick={onAppointmentClick}
        onAppointmentMove={onAppointmentMove}
      />
    </Card>
  )
}
