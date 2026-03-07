import { notFound } from "next/navigation"

import { getPatientByIdAction } from "@/app/actions/patients"
import { UpdatePatientForm } from "./update-patient-form"
import { formatCPF, formatPhoneNumber, formatRG } from "@/utils/formatters"

interface UpdatePatientPageProps {
  params: Promise<{ patient_id: string }>
}

export default async function UpdatePatientPage({ params }: UpdatePatientPageProps) {
  const { patient_id } = await params

  const patient = await getPatientByIdAction(patient_id)

  if (!patient) {
    notFound()
  }

  return (
    <UpdatePatientForm
      patientId={patient.id}
      initialValues={{
        name: patient.name,
        sex: patient.sex,
        birthDate: patient.birthDate,
        rg: formatRG(patient.rg),
        cpf: formatCPF(patient.cpf),
        phone: formatPhoneNumber(patient.phone),
        email: patient.email,
        zipCode: patient.zipCode,
        street: patient.street,
        streetNumber: patient.streetNumber,
        neighborhood: patient.neighborhood,
        city: patient.city,
        state: patient.state,
      }}
    />
  )
}
