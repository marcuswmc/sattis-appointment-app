"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { DashboardNav } from "@/components/dashboard-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src="/sattis-logo.png" alt="Sattis Studio logo" />
            <AvatarFallback>SS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-end">
            <h2 className="text-sm font-bold">Sattis Studio</h2>
            <p className="text-[.6rem] text-neutral-500">
              Welcome, <span className="font-medium">{session?.user.name}</span>
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {session?.user && <DashboardNav user={session.user} />}
      </SidebarContent>
    </Sidebar>
  );
}
