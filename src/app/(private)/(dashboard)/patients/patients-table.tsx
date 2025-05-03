"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Pencil, Eye, Trash } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableActionCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { formatCPF, formatPhoneNumber } from "@/lib/formatters"

import { type Patient } from "@/types/patient"

interface PatientsTableProps {
  patients: Patient[]
  isLoading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDetails: (id: string) => void
}

interface TableActionsProps {
  onEdit: () => void
  onDelete: () => void
  onDetails: () => void
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
            onClick={onDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ir para detalhes do paciente</TooltipContent>
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
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Excluir paciente</TooltipContent>
      </Tooltip>
    </div>
  )
}

export function PatientsTable({
  patients,
  isLoading,
  onEdit,
  onDelete,
  onDetails,
}: PatientsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams();

  const handleSort = (value: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('sort_order', value)
    } else {
      params.delete('sort_order')
    }
    router.replace(`/patients?${params.toString()}`)
  }

  const sortOrder = (searchParams.get('sort_order') ?? 'asc') as 'asc' | 'desc';

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="border-b !border-b-border">
            <TableHead className="w-1/4" sortable sortOrder={sortOrder} onSort={handleSort}>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Prontuário</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
          </TableRow>
        </TableHeader>

        {patients.length === 0 && !isLoading && (
          <TableCaption>Nenhum paciente encontrado</TableCaption>
        )}

        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{patient.name}</span>
                </div>
              </TableCell>
              <TableCell>{formatCPF(patient.cpf)}</TableCell>
              <TableCell>{patient.medicalRecord}</TableCell>
              <TableCell>{formatPhoneNumber(patient.phoneNumber)}</TableCell>
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
        </TableBody>
      </Table>
    </div>
  )
} 