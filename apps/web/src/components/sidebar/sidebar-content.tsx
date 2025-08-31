import {
  SidebarContent as ShadSidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"

interface SidebarContentProps {
  children: React.ReactNode
}

export function SidebarContent({ children }: SidebarContentProps) {
  return (
    <>
      <ShadSidebarContent className="gap-0">
        {children}
      </ShadSidebarContent>
      <SidebarRail />
    </>
  )
}
