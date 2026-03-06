"use client"

import { useActionState, useEffect } from "react"
import { Plus } from "lucide-react"

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
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import { createPatientAction } from "@/app/actions/create-patient"
import { BirthDatePicker } from "@/components/birth-date-picker"
import { formatCPF, formatPhoneNumber, formatRG } from "@/utils/formatters"
import { BRAZILIAN_STATES } from "@/constants/brasilian-states"

const CREATE_PATIENT_ERROR_MESSAGES: Record<string, string> = {
  PATIENT_CPF_ALREADY_EXISTS: "Já existe um paciente com este CPF.",
  PATIENT_RG_ALREADY_EXISTS: "Já existe um paciente com este RG.",
}

const DEFAULT_CREATE_PATIENT_ERROR_MESSAGE = "Algo deu errado ao tentar criar o paciente. Tente novamente."

export default function NewPatientPage() {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [state, action, pending] = useActionState(createPatientAction, {})

  useEffect(() => {
    setBreadcrumbs([
      { label: "Página inicial", href: "/" },
      { label: "Pacientes", href: "/patients" },
      { label: "Novo Paciente" },
    ])

    return () => {
      setBreadcrumbs([])
    }
  }, [setBreadcrumbs])


  useEffect(() => {
    if (state?.code) {
      toast.error(CREATE_PATIENT_ERROR_MESSAGES[state.code] ?? DEFAULT_CREATE_PATIENT_ERROR_MESSAGE)
    }
  }, [state?.code])

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">Cadastrar novo paciente</h1>

      <form className="mt-4 space-y-6" action={action}>
        <section className="space-y-4">
          <h2 className="border-b pb-2 text-lg font-bold text-foreground/80">Dados pessoais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name" className="mb-2 inline-block text-muted-foreground">Nome</Label>
              <Input id="name" name="name" maxLength={240} required />
            </div>

            <div>
              <Label htmlFor="sex" className="mb-2 inline-block text-muted-foreground">Sexo</Label>
              <Select name="sex" required>
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
              <BirthDatePicker id="birthDate" name="birthDate" required />
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
                onChange={(event) => {
                  event.currentTarget.value = formatPhoneNumber(event.currentTarget.value)
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex min-h-5 items-center gap-2">
                <Label htmlFor="email" className="inline-block text-muted-foreground">E-mail</Label>
                <Badge variant="secondary" className="h-4 text-[10px] px-0.5 text-muted-foreground">Opcional</Badge>
              </div>
              <Input id="email" name="email" type="email" maxLength={240} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b pb-2 text-lg font-bold text-foreground/80">Endereço</h2>
          <div className="grid gap-4 md:grid-cols-7">
            <div className="md:col-span-2">
              <Label htmlFor="zipCode" className="mb-2 inline-block text-muted-foreground">CEP</Label>
              <Input id="zipCode" name="zipCode" maxLength={25} required />
            </div>

            <div className="md:col-span-5">
              <Label htmlFor="street" className="mb-2 inline-block text-muted-foreground">Logradouro</Label>
              <Input id="street" name="street" maxLength={240} required />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="streetNumber" className="mb-2 inline-block text-muted-foreground">Número</Label>
              <Input
                id="streetNumber"
                name="streetNumber"
                type="number"
                onInput={(event) => {
                  event.currentTarget.value = event.currentTarget.value.slice(0, 20)
                }}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="neighborhood" className="mb-2 inline-block text-muted-foreground">Bairro</Label>
              <Input id="neighborhood" name="neighborhood" maxLength={240} required />
            </div>

            <div className="md:col-span-1">
              <Label htmlFor="state" className="mb-2 inline-block text-muted-foreground">UF</Label>
              <Select name="state" required>
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
              <Input id="city" name="city" maxLength={240} required />
            </div>
          </div>
        </section>

        <Button type="submit" disabled={pending}>
          <span className="inline-flex size-4 items-center justify-center">
            {pending ? <Spinner data-icon="inline-start" /> : <Plus className="size-4" />}
          </span>
          Cadastrar paciente
        </Button>
      </form>
    </div>
  )
}
