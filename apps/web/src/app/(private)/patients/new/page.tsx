"use client"

import { useEffect } from "react";

import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

export default function NewPatientPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  
  useEffect(() => {
    setBreadcrumbs([
      { label: "Página inicial", href: "/" },
      { label: "Pacientes", href: "/patients" },
      { label: "Novo Paciente" }
    ]);

    return () => {
      setBreadcrumbs([])
    }
  }, [setBreadcrumbs]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Adicionar Novo Paciente</h1>
      <form className="mt-4">
        {/* Patient form fields would go here */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
