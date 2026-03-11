import * as React from "react";
import { redirect } from "next/navigation";

import { SidebarInset } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header";

import { getCurrentDomainUserAction } from "@/app/actions/users";
import { AppProvider } from "@/contexts";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const currentDomainUser = await getCurrentDomainUserAction()

  if (!currentDomainUser.exists) {
    redirect("/complete-profile")
  }

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
