import { Separator } from "@radix-ui/react-separator";

import { SidebarTrigger } from "./ui/sidebar"
import { Breadcrumbs } from "./breadcrumbs"

export function Header() {
  return (
    <header 
      className="sticky top-0 flex h-14 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background z-10 border-b border-b-border"
    >
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>
    </header>
  )
}
