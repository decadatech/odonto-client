"use client"

import { Sidebar } from "@workspace/ui/components/sidebar";

export function SidebarRoot({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return <Sidebar collapsible="icon" {...props} />
}
