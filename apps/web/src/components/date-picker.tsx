"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

interface DatePickerProps {
  id?: string
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

function formatDateLabel(date: Date) {
  const formatted = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function DatePicker({
  id,
  value,
  onValueChange,
  placeholder = "Selecione uma data",
  className,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!value) {
      return undefined
    }

    const parsed = new Date(`${value}T00:00:00`)

    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  })

  React.useEffect(() => {
    if (!value) {
      setDate(undefined)
      return
    }

    const parsed = new Date(`${value}T00:00:00`)

    setDate(Number.isNaN(parsed.getTime()) ? undefined : parsed)
  }, [value])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          data-empty={!date}
          className={cn(
            "w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="size-4 shrink-0" />
            {date ? formatDateLabel(date) : <span>{placeholder}</span>}
          </span>
          <ChevronDownIcon className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            setDate(selectedDate)
            onValueChange?.(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")
          }}
          defaultMonth={date ?? new Date()}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}
