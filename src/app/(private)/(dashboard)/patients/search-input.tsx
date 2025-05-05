"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"

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
    router.replace(`/patients?${params.toString()}`)
  }, [debouncedSearch, router, searchParams])

  const handleSearch = (value: string) => {
    setSearchValue(value)
  }

  return (
    <Input 
      type="text" 
      className="max-w-md" 
      placeholder="Pesquisar por nome do paciente..." 
      value={searchValue}
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
} 