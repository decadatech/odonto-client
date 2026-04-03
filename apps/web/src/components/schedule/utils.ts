import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns"
import { ptBR } from "date-fns/locale"

import type { ScheduleAppointment, ScheduleTimeframe, ScheduleView } from "@/components/schedule/types"

export function toDate(value: Date | string): Date {
  if (value instanceof Date) {
    return value
  }

  return parseISO(value)
}

export function getWeekDays(referenceDate: Date) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })

  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function getMonthDays(referenceDate: Date) {
  const monthStart = startOfMonth(referenceDate)
  const monthEnd = endOfMonth(referenceDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return Array.from({ length: totalDays }, (_, index) => addDays(gridStart, index))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getViewDays(referenceDate: Date, view: ScheduleView) {
  if (view === "day") {
    return [referenceDate]
  }

  if (view === "month") {
    return getMonthDays(referenceDate)
  }

  return getWeekDays(referenceDate)
}

export function getViewTimeframe(referenceDate: Date, view: ScheduleView): ScheduleTimeframe {
  if (view === "day") {
    const from = startOfDay(referenceDate)

    return {
      from,
      to: addDays(from, 1),
    }
  }

  if (view === "month") {
    const days = getMonthDays(referenceDate)
    const from = startOfDay(days[0] ?? referenceDate)
    const lastDay = days.at(-1) ?? referenceDate

    return {
      from,
      to: addDays(startOfDay(lastDay), 1),
    }
  }

  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })

  return {
    from: startOfDay(weekStart),
    to: addDays(startOfDay(weekStart), 7),
  }
}

function getWeekLabel(referenceDate: Date): string {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 })

  if (isSameMonth(weekStart, weekEnd)) {
    return getMonthLabel(weekStart)
  }

  return `${capitalize(format(weekStart, "MMM", { locale: ptBR }))} - ${capitalize(format(weekEnd, "MMM 'de' yyyy", { locale: ptBR }))}`
}

function getMonthLabel(referenceDate: Date): string {
  return capitalize(format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR }))
}

function getDayLabel(referenceDate: Date): string {
  return capitalize(format(referenceDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }))
}

export function getViewLabel(referenceDate: Date, view: ScheduleView): string {
  if (view === "month") {
    return getMonthLabel(referenceDate)
  }

  if (view === "day") {
    return getDayLabel(referenceDate)
  }

  return getWeekLabel(referenceDate)
}

export function getViewSubtitle(view: ScheduleView) {
  if (view === "month") {
    return "Agenda mensal"
  }

  if (view === "day") {
    return "Agenda diária"
  }

  return "Agenda semanal"
}

export function isCurrentView(referenceDate: Date, view: ScheduleView, today = new Date()) {
  if (view === "month") {
    return isSameMonth(referenceDate, today)
  }

  if (view === "day") {
    return isSameDay(referenceDate, today)
  }

  return isSameDay(
    startOfWeek(referenceDate, { weekStartsOn: 1 }),
    startOfWeek(today, { weekStartsOn: 1 }),
  )
}

export function navigateToPrevious(referenceDate: Date, view: ScheduleView) {
  if (view === "month") {
    return subMonths(referenceDate, 1)
  }

  if (view === "day") {
    return subDays(referenceDate, 1)
  }

  return subWeeks(referenceDate, 1)
}

export function navigateToNext(referenceDate: Date, view: ScheduleView) {
  if (view === "month") {
    return addMonths(referenceDate, 1)
  }

  if (view === "day") {
    return addDays(referenceDate, 1)
  }

  return addWeeks(referenceDate, 1)
}

export function buildTimeSlots(startHour: number, endHour: number, intervalMinutes: number) {
  const start = new Date(2000, 0, 1, startHour, 0, 0, 0)
  const end = new Date(2000, 0, 1, endHour, 0, 0, 0)

  const slots: Date[] = []

  for (let cursor = start; cursor <= end; cursor = addMinutes(cursor, intervalMinutes)) {
    slots.push(cursor)
  }

  return slots
}

export function getAppointmentsForDay(appointments: ScheduleAppointment[], day: Date) {
  return appointments.filter((appointment) => isSameDay(toDate(appointment.start), day))
}
