import * as React from "react";

import { SidebarInset } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header";

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
        <Header />
        {children}
      </SidebarInset>
    </AppProvider>
  )
}
