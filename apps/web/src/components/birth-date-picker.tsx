"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import { cn } from "@workspace/ui/lib/utils"

type BirthDatePickerProps = {
  id: string
  name: string
  required?: boolean
}

export function BirthDatePicker({
  id,
  name,
  required,
}: BirthDatePickerProps) {
  const [date, setDate] = React.useState<Date>()
  const currentYear = new Date().getFullYear()
  const value = date ? format(date, "yyyy-MM-dd") : ""

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            id={id}
            className={cn(
              "h-9 w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={currentYear}
            defaultMonth={date ?? new Date(2000, 0)}
            disabled={(day) => day > new Date() || day < new Date("1900-01-01")}
          />
        </PopoverContent>
      </Popover>

      <input id={id} name={name} type="hidden" value={value} required={required} />
    </>
  )
}
