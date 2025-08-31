"use client"

import { useState } from "react";
import { ptBR } from "react-day-picker/locale";
import { formatDateRange } from "little-date"
import { ChevronRight, Plus } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const events = [
  {
    title: "Consulta - Gabriel Gigante",
    from: "2025-06-12T09:00:00",
    to: "2025-06-12T10:00:00",
  },
  {
    title: "Consulta - Gabriel Souza",
    from: "2025-06-12T11:30:00",
    to: "2025-06-12T12:30:00",
  },
  {
    title: "Retorno - Beatriz Varela",
    from: "2025-06-12T14:00:00",
    to: "2025-06-12T15:00:00",
  },
  {
    title: "Consulta - Gabriel Gigante 1",
    from: "2025-06-12T14:00:00",
    to: "2025-06-12T15:00:00",
  },
  {
    title: "Consulta - Gabriel Souza 2",
    from: "2025-06-12T14:00:00",
    to: "2025-06-12T15:00:00",
  },
  {
    title: "Consulta - Beatriz Varela 3",
    from: "2025-06-12T14:00:00",
    to: "2025-06-12T15:00:00",
  },
  {
    title: "Consulta - Gabriel Gigante 4",
    from: "2025-06-12T14:00:00",
    to: "2025-06-12T15:00:00",
  },
]

export function CalendarSidebar() {
  const [date, setDate] = useState<Date | undefined>(
    new Date(2025, 5, 12)
  )

  return (
    <div className="w-[272px] flex flex-col items-center border-l border-l-muted">
      <div className="w-full my-4 px-4">
        <Button className="w-full" size="default">
          <Plus className="size-4" />
          Novo agendamento
        </Button>
      </div>

      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={setDate}
        captionLayout="dropdown-years"
        locale={ptBR}
        className="px-0"
      />

      <Separator className="mt-4" />

      <div className="overflow-y-auto pt-4">
        <Collapsible defaultOpen className="group/collapsible px-4">
          <CollapsibleTrigger className="w-full flex justify-between items-center text-md font-medium">
            Agendas
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-2 space-y-2">
            {['Gabriel Gigante', 'Gabriel Souza', 'Beatriz Varela'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Checkbox id={item} />
                <label
                  htmlFor={item}
                  className="text-sm font-medium"
                >
                  {item}
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-4" />

        <div>
          <div className="flex w-full items-center justify-between px-4 mb-2">
            <div className="text-md font-medium">
              {date?.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 px-4 mb-4">
            {events.map((event) => (
              <div
                key={event.title}
                className="bg-muted/50 after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full"
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-muted-foreground text-xs">
                  {formatDateRange(new Date(event.from), new Date(event.to))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
