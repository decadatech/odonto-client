"use client"

import { useEffect } from "react";

import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

import { useSidebar } from "@/components/ui/sidebar";
import { CalendarSidebar } from "./calendar-sidebar";
import { Schedule } from "./schedule";
import { Header } from "@/components/header";

export default function Dashboard() {
  const { state } = useSidebar()
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Página inicial", href: "/" }
    ]);

    return () => {
      setBreadcrumbs([])
    }
  }, [setBreadcrumbs]);

  return (
    <div className="flex w-full max-h-screen overflow-hidden" data-sidebar-state={state}>
      <div className="flex-1">
        <Header />
        <Schedule />
      </div>

      <CalendarSidebar />
    </div>
  )
}
