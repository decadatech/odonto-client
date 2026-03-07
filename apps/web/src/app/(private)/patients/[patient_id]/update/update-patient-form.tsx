"use client"

import { useEffect } from "react"

import { updatePatientAction } from "@/app/actions/update-patient"
import { PatientForm, type PatientFormValues } from "@/components/patient-form"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

interface UpdatePatientFormProps {
  patientId: string
  initialValues: PatientFormValues
}

export function UpdatePatientForm({ patientId, initialValues }: UpdatePatientFormProps) {
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Página inicial", href: "/" },
      { label: "Pacientes", href: "/patients" },
      { label: "Editar Paciente" },
    ])

    return () => {
      setBreadcrumbs([])
    }
  }, [setBreadcrumbs])

  const action = updatePatientAction.bind(null, patientId)

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">Editar paciente</h1>

      <PatientForm
        action={action}
        submitLabel="Salvar alterações"
        mode="update"
        initialValues={initialValues}
      />
    </div>
  )
}
