import * as React from "react";
import Link from "next/link";

import { Collapsible } from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Sidebar } from "./sidebar";

import {
  BriefcaseMedical,
  CalendarDays,
  Users
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Agenda",
          url: "#install",
          icon: CalendarDays,
          isActive: true,
        },
        {
          title: "Pacientes",
          url: "/patients",
          icon: Users,
          isActive: false,
        },
        {
          title: "Dentistas",
          url: "#project",
          icon: BriefcaseMedical,
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
                        <Link href={item.url} className="flex items-center gap-2">
                          {item.icon && <item.icon />}
                          {item.title}
                        </Link>
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
