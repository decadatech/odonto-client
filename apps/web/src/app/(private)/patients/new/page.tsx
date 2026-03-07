"use client"

import { useEffect } from "react"

import { createPatientAction } from "@/app/actions/create-patient"
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
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">Cadastrar novo paciente</h1>

      <PatientForm
        action={createPatientAction}
        submitLabel="Cadastrar paciente"
        mode="create"
      />
    </div>
  )
}
