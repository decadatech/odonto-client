import { addDays, addMinutes, endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns"

import type { ScheduleAppointment } from "@/components/schedule/types"

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

export function getWeekLabel(referenceDate: Date): string {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 })

  return `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`
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
