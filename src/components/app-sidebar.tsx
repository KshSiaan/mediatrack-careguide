"use client";

import {
  CommandIcon,
  LayoutDashboardIcon,
  Stethoscope,
  UsersIcon,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/d",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Manage Doctors",
      url: "/admin/doctors",
      icon: <Stethoscope />,
    },
    {
      title: "Manage Patients",
      url: "/admin/patients",
      icon: <UsersIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();
  const user = session.data?.user;
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">MediTrack</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "User",
            email: user?.email ?? "",
            avatar: user?.image ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
