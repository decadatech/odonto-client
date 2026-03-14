"use client"

import { startTransition, useActionState, useEffect, useMemo, useRef } from "react"
import { format } from "date-fns"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "@workspace/ui/components/sonner"
import { Textarea } from "@workspace/ui/components/textarea"
import { createAppointmentAction } from "@/app/actions/appointments"
import { DatePicker } from "@/components/date-picker"
import type {
  ScheduleAppointment,
  ScheduleDentistOption,
  SchedulePatientOption,
} from "@/components/schedule/types"

const START_HOUR = 7
const END_HOUR = 20

function formatTimeOption(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function buildTimeOptions({
  startHour,
  endHour,
  includeEndHour,
}: {
  startHour: number
  endHour: number
  includeEndHour: boolean
}) {
  const options: string[] = []

  for (let hour = startHour; hour <= endHour; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === endHour && minute > 0) {
        break
      }

      if (!includeEndHour && hour === endHour && minute === 0) {
        break
      }

      options.push(formatTimeOption(hour, minute))
    }
  }

  return options
}

const START_TIME_OPTIONS = buildTimeOptions({
  startHour: START_HOUR,
  endHour: END_HOUR,
  includeEndHour: false,
})

const END_TIME_OPTIONS = buildTimeOptions({
  startHour: START_HOUR,
  endHour: END_HOUR,
  includeEndHour: true,
})

function getMinutesBetween(startTime: string, endTime: string) {
  const [startHourRaw, startMinuteRaw] = startTime.split(":")
  const [endHourRaw, endMinuteRaw] = endTime.split(":")

  const startHour = Number(startHourRaw)
  const startMinute = Number(startMinuteRaw)
  const endHour = Number(endHourRaw)
  const endMinute = Number(endMinuteRaw)

  return (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
}

function formatDurationLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  if (minutes % 60 === 0) {
    return `${minutes / 60} h`
  }

  return `${String(minutes / 60).replace(".", ",")} h`
}

interface CreateAppointmentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dentists: ScheduleDentistOption[]
  patients: SchedulePatientOption[]
  onCreateAppointment: (appointment: ScheduleAppointment) => void
}

type CreateAppointmentFormValues = {
  title: string
  description: string
  startDate: string
  startTime: string
  endTime: string
  dentistId: string
  patientId: string
}

function getDefaultValues(
  dentists: ScheduleDentistOption[],
  patients: SchedulePatientOption[],
): CreateAppointmentFormValues {
  return {
    title: "",
    description: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "09:30",
    dentistId: "",
    patientId: "",
  }
}

export function CreateAppointmentSheet({
  open,
  onOpenChange,
  dentists,
  patients,
  onCreateAppointment,
}: CreateAppointmentSheetProps) {
  const [state, formAction, pending] = useActionState(createAppointmentAction, {})
  const form = useForm<CreateAppointmentFormValues>({
    mode: "onChange",
    defaultValues: getDefaultValues(dentists, patients),
  })
  const lastHandledAppointmentIdRef = useRef<string | null>(null)

  const dentistId = form.watch("dentistId")
  const patientId = form.watch("patientId")
  const startTime = form.watch("startTime")

  const availableEndTimeOptions = useMemo(
    () => END_TIME_OPTIONS.filter((option) => option > startTime),
    [startTime],
  )

  const selectedDentist = useMemo(
    () => dentists.find((dentist) => dentist.id === dentistId),
    [dentistId, dentists],
  )

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === patientId),
    [patientId, patients],
  )

  useEffect(() => {
    const currentEndTime = form.getValues("endTime")

    if (!availableEndTimeOptions.includes(currentEndTime)) {
      form.setValue("endTime", availableEndTimeOptions[0] ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }, [availableEndTimeOptions, form])

  useEffect(() => {
    if (!selectedDentist || !selectedPatient) {
      return
    }

    const suggestedTitle = `Consulta de ${selectedPatient.name} com ${selectedDentist.name}`

    form.setValue("title", suggestedTitle, {
      shouldDirty: true,
    })
  }, [form, selectedDentist, selectedPatient])

  useEffect(() => {
    if (!state?.appointment || !selectedDentist || !selectedPatient) {
      return
    }

    if (lastHandledAppointmentIdRef.current === state.appointment.id) {
      return
    }

    lastHandledAppointmentIdRef.current = state.appointment.id

    onCreateAppointment({
      id: state.appointment.id,
      title: state.appointment.title,
      description: state.appointment.description ?? undefined,
      dentistId: state.appointment.dentistUserId,
      patientName: selectedPatient.name,
      dentistName: selectedDentist.name,
      start: new Date(state.appointment.startsAt),
      end: new Date(state.appointment.endsAt),
      color: selectedDentist.color,
      status: "scheduled",
    })

    toast.success("Agendamento criado com sucesso.")
    handleOpenChange(false)
  }, [onCreateAppointment, selectedDentist, selectedPatient, state?.appointment])

  function resetForm() {
    form.reset(getDefaultValues(dentists, patients))
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

  function handleSubmit(values: CreateAppointmentFormValues) {
    if (!selectedDentist || !selectedPatient) {
      return
    }

    const startsAt = new Date(`${values.startDate}T${values.startTime}:00`)
    const endsAt = new Date(`${values.startDate}T${values.endTime}:00`)

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      return
    }

    const payload = new FormData()

    payload.set("patientId", selectedPatient.id)
    payload.set("dentistUserId", selectedDentist.id)
    payload.set("startsAt", startsAt.toISOString())
    payload.set("endsAt", endsAt.toISOString())
    payload.set("title", values.title)

    if (values.description.trim()) {
      payload.set("description", values.description.trim())
    }

    startTransition(() => {
      formAction(payload)
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex h-full flex-col sm:max-w-md">
        <form className="flex h-full flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground">
              Criar um novo atendimento
            </SheetTitle>
            <SheetDescription className="sr-only">
              Preencha os dados para criar um novo agendamento entre paciente e dentista.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-4">
            <div className="space-y-6 pb-6">
            <div className="space-y-2">
              <Label>Dentista</Label>
              <Controller
                control={form.control}
                name="dentistId"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {dentists.map((dentist) => (
                        <SelectItem key={dentist.id} value={dentist.id}>
                          {dentist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Paciente</Label>
              <Controller
                control={form.control}
                name="patientId"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data</Label>
              <Controller
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    id="startDate"
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Selecione a data"
                    className="w-full"
                  />
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Horário de início</Label>
                <Controller
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {START_TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Horário de fim</Label>
                <Controller
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEndTimeOptions.map((time) => {
                          const durationInMinutes = getMinutesBetween(startTime, time)

                          return (
                            <SelectItem key={time} value={time}>
                              {time} ({formatDurationLabel(durationInMinutes)})
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                {...form.register("title", { required: true })}
                placeholder="Ex: Consulta de rotina"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Badge variant="secondary" className="h-4 px-0.5 text-[10px] text-muted-foreground">
                  Opcional
                </Badge>
              </div>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Adicione detalhes do atendimento"
              />
            </div>
            </div>
          </div>

          <SheetFooter className="mt-auto flex-col gap-2 border-t bg-background pt-4 sm:flex-col">
            <Button type="submit" className="w-full" disabled={pending || !form.formState.isValid}>
              <span className="inline-flex size-4 items-center justify-center">
                {pending ? <Spinner data-icon="inline-start" /> : null}
              </span>
              Salvar agendamento
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
