"use client"

import { useActionState, useEffect } from "react"
import { Pencil, Plus } from "lucide-react"

import { Spinner } from "@workspace/ui/components/spinner"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { BirthDatePicker } from "@/components/birth-date-picker"
import { formatCPF, formatPhoneNumber, formatRG } from "@/utils/formatters"
import { BRAZILIAN_STATES } from "@/constants/brasilian-states"

type PatientFormState = {
  code?: string
}

type PatientFormAction = (
  state: PatientFormState,
  formData: FormData,
) => Promise<PatientFormState>

export type PatientFormValues = {
  name: string
  sex: "male" | "female" | "other"
  birthDate: string
  rg: string
  cpf: string
  phone: string
  email: string | null
  zipCode: string
  street: string
  streetNumber: string
  neighborhood: string
  city: string
  state: string
}

interface PatientFormProps {
  action: PatientFormAction
  submitLabel: string
  mode: "create" | "update"
  initialValues?: Partial<PatientFormValues>
}

const ERROR_MESSAGES_BY_CODE: Record<string, string> = {
  PATIENT_CPF_ALREADY_EXISTS: "Já existe um paciente com este CPF.",
  PATIENT_RG_ALREADY_EXISTS: "Já existe um paciente com este RG.",
}

const DEFAULT_ERROR_MESSAGE = "Algo deu errado ao tentar salvar o paciente. Tente novamente."

export function PatientForm({ action, submitLabel, mode, initialValues }: PatientFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  useEffect(() => {
    if (state?.code) {
      toast.error(ERROR_MESSAGES_BY_CODE[state.code] ?? DEFAULT_ERROR_MESSAGE)
    }
  }, [state?.code])

  return (
    <form className="mt-4 space-y-6" action={formAction}>
      <section className="space-y-4">
        <h2 className="border-b pb-2 text-lg font-bold text-foreground/80">Dados pessoais</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name" className="mb-2 inline-block text-muted-foreground">Nome</Label>
            <Input id="name" name="name" maxLength={240} defaultValue={initialValues?.name} required />
          </div>

          <div>
            <Label htmlFor="sex" className="mb-2 inline-block text-muted-foreground">Sexo</Label>
            <Select name="sex" defaultValue={initialValues?.sex} required>
              <SelectTrigger id="sex" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="female">Feminino</SelectItem>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="birthDate" className="mb-2 inline-block text-muted-foreground">Data de nascimento</Label>
            <BirthDatePicker id="birthDate" name="birthDate" value={initialValues?.birthDate} required />
          </div>

          <div>
            <Label htmlFor="rg" className="mb-2 inline-block text-muted-foreground">RG</Label>
            <Input
              id="rg"
              name="rg"
              inputMode="numeric"
              minLength={12}
              maxLength={12}
              pattern="\d{2}\.\d{3}\.\d{3}-\d{1}"
              title="Preencha o RG completo no formato 99.999.999-9"
              defaultValue={initialValues?.rg}
              onChange={(event) => {
                event.currentTarget.value = formatRG(event.currentTarget.value)
              }}
              required
            />
          </div>

          <div>
            <Label htmlFor="cpf" className="mb-2 inline-block text-muted-foreground">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              inputMode="numeric"
              minLength={14}
              maxLength={14}
              pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
              title="Preencha o CPF completo no formato 999.999.999-99"
              defaultValue={initialValues?.cpf}
              onChange={(event) => {
                event.currentTarget.value = formatCPF(event.currentTarget.value)
              }}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="border-b pb-2 text-lg font-bold text-foreground/80">Contato</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex min-h-5 items-center">
              <Label htmlFor="phone" className="inline-block text-muted-foreground">Telefone</Label>
            </div>
            <Input
              id="phone"
              name="phone"
              inputMode="numeric"
              minLength={15}
              maxLength={15}
              pattern="\(\d{2}\)\s\d{5}-\d{4}"
              title="Preencha o telefone completo no formato (99) 99999-9999"
              defaultValue={initialValues?.phone}
              onChange={(event) => {
                event.currentTarget.value = formatPhoneNumber(event.currentTarget.value)
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex min-h-5 items-center gap-2">
              <Label htmlFor="email" className="inline-block text-muted-foreground">E-mail</Label>
              <Badge variant="secondary" className="h-4 px-0.5 text-[10px] text-muted-foreground">Opcional</Badge>
            </div>
            <Input id="email" name="email" type="email" maxLength={240} defaultValue={initialValues?.email ?? ""} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="border-b pb-2 text-lg font-bold text-foreground/80">Endereço</h2>
        <div className="grid gap-4 md:grid-cols-7">
          <div className="md:col-span-2">
            <Label htmlFor="zipCode" className="mb-2 inline-block text-muted-foreground">CEP</Label>
            <Input
              id="zipCode"
              name="zipCode"
              inputMode="numeric"
              pattern="\d*"
              maxLength={25}
              defaultValue={initialValues?.zipCode}
              onChange={(event) => {
                event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "")
              }}
              required
            />
          </div>

          <div className="md:col-span-5">
            <Label htmlFor="street" className="mb-2 inline-block text-muted-foreground">Logradouro</Label>
            <Input id="street" name="street" maxLength={240} defaultValue={initialValues?.street} required />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="streetNumber" className="mb-2 inline-block text-muted-foreground">Número</Label>
            <Input
              id="streetNumber"
              name="streetNumber"
              type="number"
              defaultValue={initialValues?.streetNumber}
              onInput={(event) => {
                event.currentTarget.value = event.currentTarget.value.slice(0, 20)
              }}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="neighborhood" className="mb-2 inline-block text-muted-foreground">Bairro</Label>
            <Input id="neighborhood" name="neighborhood" maxLength={240} defaultValue={initialValues?.neighborhood} required />
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="state" className="mb-2 inline-block text-muted-foreground">UF</Label>
            <Select name="state" defaultValue={initialValues?.state} required>
              <SelectTrigger id="state" className="w-full">
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
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="city" className="mb-2 inline-block text-muted-foreground">Cidade</Label>
            <Input id="city" name="city" maxLength={240} defaultValue={initialValues?.city} required />
          </div>
        </div>
      </section>

      <Button type="submit" disabled={pending}>
        <span className="inline-flex size-4 items-center justify-center">
          {pending ? (
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
