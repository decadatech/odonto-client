"use client"

import { useEffect } from "react";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
      <form className="mt-4 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" type="text" />
            </div>

            <div>
              <Label htmlFor="sexo">Sexo</Label>
              <select 
                id="sexo" 
                name="sexo" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input id="dataNascimento" name="dataNascimento" type="date" />
            </div>

            <div>
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input id="cpfCnpj" name="cpfCnpj" type="text" />
            </div>

            <div>
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" name="rg" type="text" />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" type="tel" />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" name="cep" type="text" />
            </div>

            <div>
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input id="logradouro" name="logradouro" type="text" />
            </div>

            <div>
              <Label htmlFor="numero">Número</Label>
              <Input id="numero" name="numero" type="text" />
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input id="complemento" name="complemento" type="text" />
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" name="bairro" type="text" />
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" name="cidade" type="text" />
            </div>

            <div>
              <Label htmlFor="uf">UF</Label>
              <select 
                id="uf" 
                name="uf" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Observations - Full Width */}
        <div className="mt-6">
          <Label htmlFor="observacoes">Observações</Label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={4}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" type="button">Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  );
}
