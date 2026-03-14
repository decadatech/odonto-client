"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

import { useDebounce } from "@/hooks/use-debounce"

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const debouncedSearch = useDebounce(searchValue, 250)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }

    const currentQuery = searchParams.toString()
    const nextQuery = params.toString()

    if (currentQuery === nextQuery) {
      return
    }

    router.replace(nextQuery ? `/patients?${nextQuery}` : '/patients')
  }, [debouncedSearch, router, searchParams])

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
