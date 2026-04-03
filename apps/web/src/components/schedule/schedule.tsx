"use client"

import { useEffect, useMemo, useState } from "react"

import { Card } from "@workspace/ui/components/card"

import { ScheduleGrid } from "@/components/schedule/schedule-grid"
import { ScheduleHeader } from "@/components/schedule/components/schedule-header"
import { ScheduleMonthView } from "@/components/schedule/schedule-month-view"
import {
  buildTimeSlots,
  getViewDays,
  getViewLabel,
  getViewSubtitle,
  getViewTimeframe,
  isCurrentView,
  navigateToNext,
  navigateToPrevious,
} from "@/components/schedule/utils"
import type { ScheduleProps } from "@/components/schedule/types"

export function Schedule({
  appointments,
  initialDate = new Date(),
  initialView = "week",
  startHour = 7,
  endHour = 20,
  intervalMinutes = 60,
  onCreateAppointment,
  onAppointmentClick,
  onAppointmentMove,
  onTimeframeChange,
}: ScheduleProps) {
  const [referenceDate, setReferenceDate] = useState(initialDate)
  const [view, setView] = useState(initialView)

  const days = useMemo(() => getViewDays(referenceDate, view), [referenceDate, view])
  const title = useMemo(() => getViewLabel(referenceDate, view), [referenceDate, view])
  const subtitle = useMemo(() => getViewSubtitle(view), [view])
  const isTodayDisabled = useMemo(() => isCurrentView(referenceDate, view), [referenceDate, view])
  const timeSlots = useMemo(() => buildTimeSlots(startHour, endHour, intervalMinutes), [startHour, endHour, intervalMinutes])

  useEffect(() => {
    onTimeframeChange?.(getViewTimeframe(referenceDate, view))
  }, [onTimeframeChange, referenceDate, view])

  return (
    <Card className="py-0 gap-0 rounded-xs overflow-hidden">
      <ScheduleHeader
        title={title}
        subtitle={subtitle}
        view={view}
        isTodayDisabled={isTodayDisabled}
        onToday={() => setReferenceDate(new Date())}
        onPrevious={() => setReferenceDate((current) => navigateToPrevious(current, view))}
        onNext={() => setReferenceDate((current) => navigateToNext(current, view))}
        onViewChange={setView}
        onCreateAppointment={() => onCreateAppointment?.()}
      />

      {view === "month" ? (
        <ScheduleMonthView
          days={days}
          referenceDate={referenceDate}
          appointments={appointments}
          onCreateAppointment={onCreateAppointment}
          onAppointmentClick={onAppointmentClick}
        />
      ) : (
        <ScheduleGrid
          days={days}
          appointments={appointments}
          timeSlots={timeSlots}
          startHour={startHour}
          endHour={endHour}
          intervalMinutes={intervalMinutes}
          onCreateAppointment={onCreateAppointment}
          onAppointmentClick={onAppointmentClick}
          onAppointmentMove={onAppointmentMove}
        />
      )}
    </Card>
  )
}
