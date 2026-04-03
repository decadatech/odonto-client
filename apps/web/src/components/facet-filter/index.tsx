"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

export interface FacetFilterOption {
  value: string
  label: string
}

interface FacetFilterProps {
  title: string
  options: FacetFilterOption[]
  allOptions?: FacetFilterOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
  onReset: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  emptyMessage?: string
  isLoading?: boolean
  loadingMessage?: string
}

function getSelectionSummary(selectedOptions: FacetFilterOption[], selectedCount: number) {
  if (selectedOptions.length === selectedCount && selectedOptions.length <= 2) {
    return selectedOptions.map((option) => option.label)
  }

  return [`${selectedCount} selecionado${selectedCount === 1 ? "" : "s"}`]
}

export function FacetFilter({
  title,
  options,
  allOptions,
  selectedValues,
  onToggle,
  onReset,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar opção...",
  emptyMessage = "Nenhuma opção encontrada.",
  isLoading = false,
  loadingMessage = "Carregando opções...",
}: FacetFilterProps) {
  const selectedOptions = (allOptions ?? options).filter((option) =>
    selectedValues.includes(option.value),
  )
  const selectedCount = selectedValues.length
  const selectionSummary = getSelectionSummary(selectedOptions, selectedCount)
  const isSearchEnabled = typeof onSearchChange === "function"

  return (
    <Popover>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="h-9 border-dashed">
              <span>{title}</span>
              {selectedCount > 0 ? (
                <>
                  <span className="hidden h-4 w-px bg-border sm:block" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal sm:hidden">
                    {selectedCount}
                  </Badge>
                  <div className="hidden items-center gap-1 sm:flex">
                    {selectionSummary.map((label) => (
                      <Badge
                        key={`${title}-${label}`}
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : null}
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>

        {selectedCount >= 3 && (
          <TooltipContent className="max-w-[400px] text-center">
            {selectedOptions.map((item) => item.label).join(", ")}
          </TooltipContent>
        )}
      </Tooltip>

      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b px-3 py-3">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">Selecione uma ou mais opções.</p>
        </div>

        {isSearchEnabled ? (
          <div className="border-b p-3">
            <Input
              type="text"
              inputSize="sm"
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
        ) : null}

        <div className="max-h-72 overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              <span>{loadingMessage}</span>
            </div>
          ) : options.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selectedValues.includes(option.value)

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent/60 text-accent-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-[4px] border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-transparent",
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                  <span className="flex-1 text-left">{option.label}</span>
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {selectedCount} selecionado{selectedCount === 1 ? "" : "s"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={onReset}
            disabled={selectedCount === 0}
          >
            Limpar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
