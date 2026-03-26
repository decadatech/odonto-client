"use client"

import { Suspense, use, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { PatientsTable } from "./patients-table"
import { SearchInput } from "./search-input"

import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import { usePatientsQuery } from "@/hooks/queries/patients"

import type { Pagination } from "@/types/api"

interface PatientsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function Patients({ searchParams }: PatientsPageProps) {
  const router = useRouter()
  const { search, sort_order } = use(searchParams) as {
    search: string
    sort_order: Pagination["sort_order"]
  }

  const {
    data: patients = [],
    isLoading,
  } = usePatientsQuery({
    search,
    sortOrder: sort_order,
  })
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
        <Suspense>
          <SearchInput />
        </Suspense>

        <Button asChild>
          <Link href="/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <Suspense>
        <PatientsTable
          patients={patients}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDetails={handleDetails}
        />
      </Suspense>
    </div>
  )
}
