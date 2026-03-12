"use client"

import { useActionState, useEffect, useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "@workspace/ui/components/sonner"
import { ChoiceCard, type ChoiceCardOption } from "@/components/choice-card"
import { createCurrentDomainUserAction } from "@/app/actions/users"

const ERROR_MESSAGES_BY_CODE: Record<string, string> = {
  USER_ALREADY_EXISTS: "Usuário já cadastrado na organização.",
  USER_CRO_REQUIRED: "CRO é obrigatório para o perfil de dentista.",
}

const DEFAULT_ERROR_MESSAGE = "Não foi possível completar o perfil. Tente novamente."

const ROLE_OPTIONS = [
  {
    value: "secretary",
    title: "Secretário(a)",
    description: "Permissão a todas as ações da aplicação.",
  },
  {
    value: "dentist",
    title: "Dentista",
    description: "Além de todas as permissões, poderá ser atribuído a atendimentos.",
  },
] satisfies ChoiceCardOption[]

type CompleteProfileFormProps = {
  displayName: string
}

export function CompleteProfileForm({ displayName }: CompleteProfileFormProps) {  
  const [state, formAction, pending] = useActionState(createCurrentDomainUserAction, {})
  const [role, setRole] = useState<"secretary" | "dentist" | "">("")

  useEffect(() => {
    if (state?.code) {
      toast.error(ERROR_MESSAGES_BY_CODE[state.code] ?? DEFAULT_ERROR_MESSAGE)
    }
  }, [state?.code])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.45)_100%)] p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_60%)]" />

      <div className="relative w-full max-w-md rounded border bg-card/95 p-6 shadow-lg backdrop-blur">
        <div className="mb-6 space-y-3">
          <span className="inline-flex rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            Primeiro acesso
          </span>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bem-vindo, {displayName}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Falta um passo para liberar sua conta na plataforma. Defina seu cargo na clínica para continuar.
            </p>
          </div>
        </div>

        <form className="space-y-4" action={formAction}>
          <div className="space-y-2">
            <Label htmlFor="role">Cargo</Label>
            <ChoiceCard
              name="role"
              value={role}
              onValueChange={(value) => setRole(value as "secretary" | "dentist")}
              options={ROLE_OPTIONS}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cro">CRO</Label>
            <Input
              id="cro"
              name="cro"
              maxLength={20}
              placeholder="Informe seu CRO"
              required={role === "dentist"}
              disabled={role !== "dentist"}
            />
          </div>

          <Button className="w-full" type="submit" disabled={pending}>
            <span className="inline-flex size-4 items-center justify-center">
              {pending ? <Spinner data-icon="inline-start" /> : <Check className="size-4" />}
            </span>
            Concluir perfil
          </Button>
        </form>
      </div>
    </div>
  )
}
