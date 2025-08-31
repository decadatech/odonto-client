import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/breadcrumbs";

export function Header() {
  return (
    <header 
      className="
        sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 transition-all duration-200 ease-linear
        bg-background/95 backdrop-blur
        supports-[backdrop-filter]:bg-background/60 border-b border-b-muted
      "
    >
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>
    </header>
  )
}
