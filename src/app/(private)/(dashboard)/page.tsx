'use client'

import { useEffect } from "react"
import { useBreadcrumb } from "@/contexts/breadcrumb"

export default function Dashboard() {
  const { setBreadcrumb } = useBreadcrumb()

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/" },
      { label: "Pacientes", href: "/patients" },
      { label: "Test", href: "/test" }
    ])
  }, [setBreadcrumb])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <p className="text-2xl font-bold">hello world</p>
        <p className="text-2xl font-bold">hello world</p>
      </div>
    </div>
  )
}
