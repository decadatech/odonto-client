import { Sidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const USER = {
  name: "Gabriel Gigante",
  email: "gigante@example.com",
  avatar: "https://avatars.githubusercontent.com/u/48386738?v=4",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <Sidebar.Root collapsible="icon">
        <Sidebar.Header />
        <Sidebar.Content />
        <Sidebar.Footer user={USER} /> 
      </Sidebar.Root>

      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}