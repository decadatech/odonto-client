"use client"

import * as React from "react"
import { Pencil, Eye, Trash } from "lucide-react"

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableActionCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@workspace/ui/components/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { formatRG, formatPhoneNumber } from "@/utils/formatters"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { usePatientsTableParams } from "../../hooks/use-patients-table-params"
import { type Patient } from "@/types/patient"

interface PatientsTableProps {
  patients: Patient[]
  isLoading: boolean
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDetails: (id: string) => void
}

interface TableActionsProps {
  onEdit: () => void
  onDelete: () => void
  onDetails: () => void
}

function PatientsTableSkeletonRows() {
  return Array.from({ length: 5 }, (_, index) => (
    <TableRow key={`patients-skeleton-${index}`}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-36" />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
        </div>
      </TableCell>
    </TableRow>
  ))
}

function TableActions({ onEdit, onDelete, onDetails }: TableActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 hover:text-primary transition-colors"
            disabled
            onClick={onDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Em breve</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-amber-50 hover:text-amber-600 transition-colors"
            onClick={onEdit}
      >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Editar paciente</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-red-50 hover:text-red-600 transition-colors"
            disabled
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Em breve</TooltipContent>
      </Tooltip>
    </div>
  )
}

export function PatientsTable({
  patients,
  isLoading,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onEdit,
  onDelete,
  onDetails,
}: PatientsTableProps) {
  const { sortOrder, setSortOrder } = usePatientsTableParams()
  const loadMoreRef = useInfiniteScroll(
    () => {
      if (onLoadMore) {
        onLoadMore()
      }
    },
    hasMore && !isLoading && !isLoadingMore,
  )

  const handleSort = (value: "asc" | "desc") => {
    void setSortOrder(value)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="border-b !border-b-border">
            <TableHead className="w-1/4" sortable sortOrder={sortOrder} onSort={handleSort}>Nome</TableHead>
            <TableHead>RG</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
          </TableRow>
        </TableHeader>

        {patients.length === 0 && !isLoading && (
          <TableCaption className="my-4">Nenhum paciente encontrado</TableCaption>
        )}

        <TableBody>
          {isLoading && <PatientsTableSkeletonRows />}

          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {patient.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{patient.nome}</span>
                </div>
              </TableCell>
              <TableCell>{formatRG(patient.rg)}</TableCell>
              <TableCell>{formatPhoneNumber(patient.telefone)}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableActionCell
                actions={
                  <TableActions
                    onEdit={() => onEdit(patient.id)}
                    onDelete={() => onDelete(patient.id)}
                    onDetails={() => onDetails(patient.id)}
                  />
                }
              />
            </TableRow>
          ))}

          {!isLoading && patients.length > 0 && (hasMore || isLoadingMore) && (
            <TableRow>
              <TableCell colSpan={5} className="py-4">
                <div
                  ref={loadMoreRef}
                  data-testid="patients-load-more-trigger"
                  className="flex min-h-10 items-center justify-center text-sm text-muted-foreground"
                >
                  {isLoadingMore
                    ? "Carregando mais pacientes..."
                    : "Role para carregar mais pacientes"}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
