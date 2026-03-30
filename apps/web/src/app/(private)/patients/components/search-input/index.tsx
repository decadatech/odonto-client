"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { useDebounce } from "@/hooks/use-debounce"
import { usePatientsTableParams } from "../../hooks/use-patients-table-params"

export function SearchInput() {
  const { search, setSearch } = usePatientsTableParams()
  const [searchValue, setSearchValue] = useState(search)

  const debouncedSearch = useDebounce(searchValue, 250)

  useEffect(() => {
    if (debouncedSearch === search) {
      return
    }

    void setSearch(debouncedSearch)
  }, [debouncedSearch, search, setSearch])

  useEffect(() => {
    setSearchValue(search)
  }, [search])

  const handleSearch = (value: string) => {
    setSearchValue(value)
  }

  return (
    <div className='w-96 h-9 relative'>
      <Input
        type="text"
        className="max-w-md"
        placeholder="Pesquisar por nome do paciente..."
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {searchValue !== '' && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => handleSearch('')}
        >
          <X className="h-2 w-2" />
        </Button>
      )}
    </div>
  )
}
