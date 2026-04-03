export type ScheduleAppointmentStatus = "scheduled" | "confirmed" | "cancelled"
export type ScheduleAppointmentColor = "teal" | "amber" | "rose" | "violet" | "sky"
export type ScheduleView = "month" | "week" | "day"

export interface ScheduleTimeframe {
  from: Date
  to: Date
}

export interface ScheduleDentistOption {
  id: string
  name: string
  color: ScheduleAppointmentColor
}

export interface SchedulePatientOption {
  id: string
  name: string
}

export interface ScheduleAppointment {
  id: string
  title: string
  description?: string
  start: Date | string
  end: Date | string
  dentistId?: string
  patientName?: string
  dentistName?: string
  color?: ScheduleAppointmentColor
  status?: ScheduleAppointmentStatus
}

export interface ScheduleAppointmentDraft {
  start: Date
  end: Date
}

export interface CreateScheduleAppointmentInput {
  patientId: string
  title: string
  description?: string
  start: Date
  end: Date
  dentistId: string
  dentistName: string
  patientName: string
  color: ScheduleAppointmentColor
}

export interface ScheduleProps {
  appointments: ScheduleAppointment[]
  initialDate?: Date
  initialView?: ScheduleView
  startHour?: number
  endHour?: number
  intervalMinutes?: number
  onCreateAppointment?: (draft?: ScheduleAppointmentDraft) => void
  onAppointmentClick?: (appointment: ScheduleAppointment) => void
  onAppointmentMove?: (appointmentId: string, start: Date, end: Date) => void
  onTimeframeChange?: (timeframe: ScheduleTimeframe) => void
}
