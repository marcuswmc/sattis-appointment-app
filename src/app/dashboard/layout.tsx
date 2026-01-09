import type React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }>
      <AppSidebar variant="inset"/>
      <SidebarInset>
      <div className="flex min-h-screen">
        <div className="flex w-full">
          <main className="flex-1 overflow-auto px-4 w-full ">
            <div className="flex h-14 items-center gap-2 justify-between">
              <div className="flex md:w-full items-center gap-2 justify-between">
                <SidebarTrigger className="cursor-pointer" />
                <ModeToggle/>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <div className="flex flex-col items-end">
                  <h2 className="text-sm font-bold">Sattis Studio</h2>
                  <p className="text-[.6rem] text-neutral-500">
                    Welcome,{" "}
                    <span className="font-medium">{session.user.name}</span>
                  </p>
                </div>
                <Avatar className="size-8">
                  <AvatarImage
                    src="/sattis-logo.png"
                    alt="Sattis Studio logo"
                  />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="pt-8 md:pt-0">{children}</div>
          </main>
        </div>
      </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
