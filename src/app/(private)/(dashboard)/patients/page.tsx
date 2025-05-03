"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingIndicator } from "@/components/loading-indicator"
import { PatientsTable } from "./patients-table"

import { useInfinitePatients } from "@/hooks/queries/patients"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

export default function Patients() {
  const { data: patientsData, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfinitePatients()
  const patients = patientsData?.pages.flatMap(page => page.data) ?? []

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    hasNextPage && !isFetchingNextPage
  )

  const handleEdit = (id: string) => {
    // TODO
    console.log("Edit patient", id)
  }

  const handleDelete = (id: string) => {
    // TODO
    console.log("Delete patient", id)
  }

  const handleDetails = (id: string) => {
    // TODO
    console.log("View patient details", id)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-2">
        <Input type="text" className="max-w-md" placeholder="Pesquisar por nome do paciente..." />

        <Button asChild>
          <Link href="/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <PatientsTable
        patients={patients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDetails={handleDetails}
      />

      <LoadingIndicator isLoading={isLoading || isFetchingNextPage} />
      
      <div ref={loadMoreRef} className="h-0 w-full" />
    </div>
  )
}