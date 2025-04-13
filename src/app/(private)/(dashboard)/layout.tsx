import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header";
import { BreadcrumbProvider } from '@/contexts/breadcrumb'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <BreadcrumbProvider>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <div className="flex flex-col h-full">
            <Header />

            <main className="flex-1 pt-4 overflow-auto">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  )
}