"use client"

import * as React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { Pencil, Plus } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "@workspace/ui/components/sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { BirthDatePicker } from "@/components/birth-date-picker"
import { BRAZILIAN_STATES } from "@/constants/brasilian-states"
import { isPatientMutationError, usePatientMutation } from "@/hooks/mutations/patients"
import { patientFormSchema } from "@/schemas/patients"
import { formatCPF, formatPhoneNumber, formatRG } from "@/utils/formatters"

type PatientFormFieldValues = z.input<typeof patientFormSchema>

export type PatientFormValues = Omit<PatientFormFieldValues, "email"> & {
  email: string | null
}

type PatientFormProps =
  | {
    submitLabel: string
    mode: "create"
    initialValues?: Partial<PatientFormValues>
  }
  | {
    submitLabel: string
    mode: "update"
    patientId: string
    initialValues?: Partial<PatientFormValues>
  }

type PatientFormBaseProps = {
  submitLabel: string
  initialValues?: Partial<PatientFormValues>
}

const ERROR_MESSAGES_BY_CODE: Record<string, string> = {
  PATIENT_CPF_ALREADY_EXISTS: "Já existe um paciente com este CPF.",
  PATIENT_RG_ALREADY_EXISTS: "Já existe um paciente com este RG.",
}

const DEFAULT_ERROR_MESSAGE = "Algo deu errado ao tentar salvar o paciente. Tente novamente."
const FIELD_LABEL_CLASSNAME = "text-muted-foreground group-data-[invalid=true]/field:text-destructive"
const FIELD_CLASSNAME = "gap-1.5"
const FIELD_ERROR_SLOT_CLASSNAME = "min-h-3"
const FIELD_ERROR_CLASSNAME = "text-[11px] leading-3"

function getDefaultValues(initialValues?: Partial<PatientFormValues>): PatientFormFieldValues {
  return {
    name: initialValues?.name ?? "",
    sex: initialValues?.sex ?? "",
    birthDate: initialValues?.birthDate ?? "",
    rg: initialValues?.rg ?? "",
    cpf: initialValues?.cpf ?? "",
    phone: initialValues?.phone ?? "",
    email: initialValues?.email ?? "",
    zipCode: initialValues?.zipCode ?? "",
    street: initialValues?.street ?? "",
    streetNumber: initialValues?.streetNumber ?? "",
    neighborhood: initialValues?.neighborhood ?? "",
    city: initialValues?.city ?? "",
    state: initialValues?.state ?? "",
  }
}

function PatientFieldError({
  error,
}: {
  error?: { message?: string }
}) {
  return (
    <div className={FIELD_ERROR_SLOT_CLASSNAME}>
      <FieldError className={FIELD_ERROR_CLASSNAME} errors={[error]} />
    </div>
  )
}

export function PatientForm(props: PatientFormProps) {
  const { submitLabel, mode, initialValues } = props
  const router = useRouter()
  const queryClient = useQueryClient()
  const mutation = usePatientMutation(
    mode === "create"
      ? { mode: "create" }
      : { mode: "update", patientId: props.patientId },
  )
  const form = useForm<PatientFormFieldValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: getDefaultValues(initialValues),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  })

  useEffect(() => {
    form.reset(getDefaultValues(initialValues))
  }, [form, initialValues])

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values)
      await queryClient.invalidateQueries({
        queryKey: ["patients"],
      })
      router.push("/patients")
    } catch (error) {
      toast.error(
        isPatientMutationError(error)
          ? (ERROR_MESSAGES_BY_CODE[error.code] ?? DEFAULT_ERROR_MESSAGE)
          : DEFAULT_ERROR_MESSAGE,
      )
    }
  })

  return (
    <form className="mt-4 space-y-6" noValidate onSubmit={submit}>
      <section className="space-y-4">
        <h2 className="border-b pb-2 text-lg font-bold text-foreground/80">Dados pessoais</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field className={`${FIELD_CLASSNAME} md:col-span-2`} data-invalid={form.formState.errors.name ? true : undefined}>
            <FieldLabel htmlFor="name" className={FIELD_LABEL_CLASSNAME}>Nome</FieldLabel>
            <Input
              id="name"
              maxLength={240}
              aria-invalid={form.formState.errors.name ? true : undefined}
              {...form.register("name")}
            />
            <PatientFieldError error={form.formState.errors.name} />
          </Field>

          <Controller
            control={form.control}
            name="sex"
            render={({ field, fieldState }) => (
              <Field className={FIELD_CLASSNAME} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="sex" className={FIELD_LABEL_CLASSNAME}>Sexo</FieldLabel>
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="sex"
                    className="w-full"
                    aria-invalid={fieldState.invalid ? true : undefined}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="birthDate"
            render={({ field, fieldState }) => (
              <Field className={FIELD_CLASSNAME} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="birthDate" className={FIELD_LABEL_CLASSNAME}>Data de nascimento</FieldLabel>
                <BirthDatePicker
                  id="birthDate"
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={fieldState.invalid ? true : undefined}
                />
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="rg"
            render={({ field, fieldState }) => (
              <Field className={FIELD_CLASSNAME} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="rg" className={FIELD_LABEL_CLASSNAME}>RG</FieldLabel>
                <Input
                  id="rg"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  inputMode="numeric"
                  maxLength={12}
                  title="Preencha o RG completo no formato 99.999.999-9"
                  aria-invalid={fieldState.invalid ? true : undefined}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(formatRG(event.currentTarget.value))
                  }}
                />
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="cpf"
            render={({ field, fieldState }) => (
              <Field className={FIELD_CLASSNAME} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="cpf" className={FIELD_LABEL_CLASSNAME}>CPF</FieldLabel>
                <Input
                  id="cpf"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  inputMode="numeric"
                  maxLength={14}
                  title="Preencha o CPF completo no formato 999.999.999-99"
                  aria-invalid={fieldState.invalid ? true : undefined}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(formatCPF(event.currentTarget.value))
                  }}
                />
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="border-b pb-2 text-lg font-bold text-foreground/80">Contato</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field className={FIELD_CLASSNAME} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="phone" className={FIELD_LABEL_CLASSNAME}>Telefone</FieldLabel>
                <Input
                  id="phone"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  inputMode="numeric"
                  maxLength={15}
                  title="Preencha o telefone completo no formato (99) 99999-9999"
                  aria-invalid={fieldState.invalid ? true : undefined}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(formatPhoneNumber(event.currentTarget.value))
                  }}
                />
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field className={FIELD_CLASSNAME} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="email" className={FIELD_LABEL_CLASSNAME}>
                  E-mail
                  <Badge variant="secondary" className="h-4 px-0.5 text-[10px] text-muted-foreground group-data-[invalid=true]/field:text-destructive">
                    Opcional
                  </Badge>
                </FieldLabel>
                <Input
                  id="email"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  type="email"
                  maxLength={240}
                  aria-invalid={fieldState.invalid ? true : undefined}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="border-b pb-2 text-lg font-bold text-foreground/80">Endereço</h2>
        <div className="grid gap-4 md:grid-cols-7">
          <Controller
            control={form.control}
            name="zipCode"
            render={({ field, fieldState }) => (
              <Field className={`${FIELD_CLASSNAME} md:col-span-2`} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="zipCode" className={FIELD_LABEL_CLASSNAME}>CEP</FieldLabel>
                <Input
                  id="zipCode"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  inputMode="numeric"
                  maxLength={25}
                  aria-invalid={fieldState.invalid ? true : undefined}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value.replace(/\D/g, ""))
                  }}
                />
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />

          <Field className={`${FIELD_CLASSNAME} md:col-span-5`} data-invalid={form.formState.errors.street ? true : undefined}>
            <FieldLabel htmlFor="street" className={FIELD_LABEL_CLASSNAME}>Logradouro</FieldLabel>
            <Input
              id="street"
              maxLength={240}
              aria-invalid={form.formState.errors.street ? true : undefined}
              {...form.register("street")}
            />
            <PatientFieldError error={form.formState.errors.street} />
          </Field>

          <Controller
            control={form.control}
            name="streetNumber"
            render={({ field, fieldState }) => (
              <Field className={`${FIELD_CLASSNAME} md:col-span-2`} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="streetNumber" className={FIELD_LABEL_CLASSNAME}>Número</FieldLabel>
                <Input
                  id="streetNumber"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  type="number"
                  aria-invalid={fieldState.invalid ? true : undefined}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value.slice(0, 20))
                  }}
                />
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />

          <Field className={`${FIELD_CLASSNAME} md:col-span-2`} data-invalid={form.formState.errors.neighborhood ? true : undefined}>
            <FieldLabel htmlFor="neighborhood" className={FIELD_LABEL_CLASSNAME}>Bairro</FieldLabel>
            <Input
              id="neighborhood"
              maxLength={240}
              aria-invalid={form.formState.errors.neighborhood ? true : undefined}
              {...form.register("neighborhood")}
            />
            <PatientFieldError error={form.formState.errors.neighborhood} />
          </Field>

          <Controller
            control={form.control}
            name="state"
            render={({ field, fieldState }) => (
              <Field className={`${FIELD_CLASSNAME} md:col-span-1`} data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="state" className={FIELD_LABEL_CLASSNAME}>UF</FieldLabel>
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="state"
                    className="w-full"
                    aria-invalid={fieldState.invalid ? true : undefined}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {BRAZILIAN_STATES.map((stateOption) => (
                      <SelectItem key={stateOption.value} value={stateOption.value}>
                        {stateOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <PatientFieldError error={fieldState.error} />
              </Field>
            )}
          />

          <Field className={`${FIELD_CLASSNAME} md:col-span-2`} data-invalid={form.formState.errors.city ? true : undefined}>
            <FieldLabel htmlFor="city" className={FIELD_LABEL_CLASSNAME}>Cidade</FieldLabel>
            <Input
              id="city"
              maxLength={240}
              aria-invalid={form.formState.errors.city ? true : undefined}
              {...form.register("city")}
            />
            <PatientFieldError error={form.formState.errors.city} />
          </Field>
        </div>
      </section>

      <Button type="submit" disabled={mutation.isPending}>
        <span className="inline-flex size-4 items-center justify-center">
          {mutation.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : mode === "update" ? (
            <Pencil className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}
        </span>
        {submitLabel}
      </Button>
    </form>
  )
}
