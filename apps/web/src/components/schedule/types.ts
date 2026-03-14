export type ScheduleAppointmentStatus = "scheduled" | "confirmed" | "cancelled"
export type ScheduleAppointmentColor = "teal" | "amber" | "rose" | "violet" | "sky"

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
  startHour?: number
  endHour?: number
  intervalMinutes?: number
  onCreateAppointment?: () => void
  onAppointmentClick?: (appointment: ScheduleAppointment) => void
  onAppointmentMove?: (appointmentId: string, start: Date, end: Date) => void
}
