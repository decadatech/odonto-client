"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useBreadcrumb } from "@/contexts/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Patients() {
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([{ label: "Pacientes", href: "/patients" }]);
  }, [setBreadcrumb]);

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/patients/new">
            <Plus /> Adicionar paciente
          </Link>
        </Button>
      </div>

      <Input type="text" placeholder="Pesquise por nome do paciente..." />

      <Table>
        {/* <TableCaption>Nenhum paciente encontrado.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>RG</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* {invoices.map((invoice) => ( */}
          <TableRow>
            <TableCell className="flex items-center gap-2 font-medium">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">GG</AvatarFallback>
              </Avatar>
              Gabriel Gigante
            </TableCell>
            <TableCell>gabriel_gigante@outlook.com</TableCell>
            <TableCell>(11) 99999-9999</TableCell>
            <TableCell>12.345.678-0</TableCell>
            <TableCell>123.000.000-00</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Editar paciente 
                    <Pencil className="ml-auto" />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Excluir paciente
                    <Trash2 className="ml-auto" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          {/* ))} */}
        </TableBody>
      </Table>
    </div>
  );
}
