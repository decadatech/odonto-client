'use client'

import { useEffect } from "react"
import { useBreadcrumb } from "@/contexts/breadcrumb"

export default function NewPatient() {
  const { setBreadcrumb } = useBreadcrumb()

  useEffect(() => {
    setBreadcrumb([
      { label: "Pacientes", href: "/patients" },   
      { label: "Novo paciente", href: "/patients/new" },
    ])
  }, [setBreadcrumb])
  
  return (
    <div className="px-4">
      <h1>New Patient</h1>
    </div>
  )
}