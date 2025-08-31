import * as React from "react";

import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { AppProvider } from "@/contexts";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AppProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </AppProvider>
  )
}
