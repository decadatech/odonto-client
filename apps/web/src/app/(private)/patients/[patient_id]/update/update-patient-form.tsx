"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
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
      <div className="mb-6 flex items-center gap-3">
        <Button asChild type="button" variant="outline" size="icon" aria-label="Voltar">
          <Link href="/patients">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar paciente</h1>
      </div>

      <PatientForm
        action={action}
        submitLabel="Salvar alterações"
        mode="update"
        initialValues={initialValues}
      />
    </div>
  )
}
