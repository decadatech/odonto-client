import * as React from "react";

import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Sidebar } from "./sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      // url: "#",
      items: [
        {
          title: "Agenda",
          url: "#install",
          isActive: true,
        },
        {
          title: "Pacientes",
          url: "#install",
          isActive: false,
        },
        {
          title: "Dentistas",
          url: "#project",
          isActive: false,
        },
      ],
    },
  ],
};

const USER = {
  name: "Gabriel Gigante",
  email: "gigante@example.com",
  avatar: "https://avatars.githubusercontent.com/u/48386738?v=4",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar.Root>) {
  return (
    <Sidebar.Root {...props}>
      <Sidebar.Header title="Nome da clínica" />

      <Sidebar.Content>
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <a href={item.url}>{item.title}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </Sidebar.Content>

      <Sidebar.Footer user={USER} />
    </Sidebar.Root>
  );
}
