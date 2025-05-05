"use client"

import { use, Suspense } from 'react'
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadingIndicator } from "@/components/loading-indicator"
import { PatientsTable } from "./patients-table"
import { SearchInput } from './search-input'

import { useInfinitePatients } from "@/hooks/queries/patients"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

import type { Pagination } from '@/types/api'

interface PatientsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function Patients({ searchParams }: PatientsPageProps) {
  const { search, sort_order } = use(searchParams) as { search: string, sort_order: Pagination['sort_order'] }
  
  const { 
    data: patientsData,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfinitePatients({ sort_order: sort_order || 'asc', search })
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
          isLoading={isFetching}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDetails={handleDetails}
        />
      </Suspense>

      <LoadingIndicator label="Carregando pacientes..." isLoading={isFetching} />

      <div ref={loadMoreRef} className="h-0 w-full" />
    </div>
  )
}
