import { Sidebar } from "../ui/sidebar";

export function SidebarRoot({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return <Sidebar collapsible="icon" {...props} />
}
