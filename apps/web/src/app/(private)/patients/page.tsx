"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import type { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import { PatientsTable } from "./components/patients-table"
import { SearchInput } from "./components/search-input"
import { usePatientsTableParams } from "./hooks/use-patients-table-params"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import { useInfinitePatientsQuery } from "@/hooks/queries/patients"
import type { patientSchema } from "@/schemas/patients"
import type { Patient } from "@/types/patient"

function mapApiPatientToPatient(patient: z.infer<typeof patientSchema>): Patient {
  return {
    id: patient.id,
    nome: patient.name,
    rg: patient.rg,
    telefone: patient.phone,
    email: patient.email ?? "-",
  }
}

export default function Patients() {
  const router = useRouter()
  const { search, sortOrder } = usePatientsTableParams()

  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePatientsQuery({
    search,
    sortOrder,
    limit: 20,
  })
  const patients = data?.pages.flatMap((page) => page.items.map(mapApiPatientToPatient)) ?? []
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Página inicial", href: "/" },
      { label: "Pacientes", href: "/patients" },
    ])

    return () => {
      setBreadcrumbs([])
    }
  }, [setBreadcrumbs])

  const handleEdit = (id: string) => {
    router.push(`/patients/${id}/update`)
  }

  const handleDelete = (id: string) => {
    console.log("Delete patient", id)
  }

  const handleDetails = (id: string) => {
    console.log("View patient details", id)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <SearchInput />

        <Button asChild>
          <Link href="/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <PatientsTable
        patients={patients}
        isLoading={isPending}
        hasMore={Boolean(hasNextPage)}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDetails={handleDetails}
      />
    </div>
  )
}
