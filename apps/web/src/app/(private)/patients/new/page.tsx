"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createPatientAction } from "@/app/actions/create-patient"
import { Button } from "@workspace/ui/components/button"
import { PatientForm } from "@/components/patient-form"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

export default function NewPatientPage() {
  const { setBreadcrumbs } = useBreadcrumbs()

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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild type="button" variant="outline" size="icon" aria-label="Voltar">
          <Link href="/patients">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cadastrar novo paciente</h1>
      </div>

      <PatientForm
        action={createPatientAction}
        submitLabel="Cadastrar paciente"
        mode="create"
      />
    </div>
  )
}
