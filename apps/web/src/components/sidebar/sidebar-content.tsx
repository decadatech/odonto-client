import {
  SidebarContent as ShadSidebarContent,
  SidebarRail,
} from "@workspace/ui/components/sidebar"

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
