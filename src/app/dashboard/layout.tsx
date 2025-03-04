import type React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import sattisLogo from "@/public/sattis-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
    
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="flex w-full">
          <Sidebar>
            <SidebarHeader className="p-0">
              <div className="flex items-center gap-2 p-4">
                <Avatar>
                  <AvatarImage src={sattisLogo.src} alt="Sattis Studio logo" />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold">Sattis Studio</h2>
                  <p className="text-[.8rem] text-gray-500">
                    Welcome,{" "}
                    <span className="font-medium text-gray-600">
                      {session.user.name}
                    </span>
                  </p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <DashboardNav user={session.user} />
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 overflow-auto p-4 md:p-6 w-full">
            <div className="flex h-14 items-center gap-2 md:hidden justify-between">
              <SidebarTrigger/>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <h2 className="text-sm font-bold">Sattis Studio</h2>
                  <p className="text-[.6rem] text-gray-500">
                    Welcome,{" "}
                    <span className="font-medium text-gray-600">
                      {session.user.name}
                    </span>
                  </p>
                </div>
                <Avatar>
                  <AvatarImage src={sattisLogo.src} alt="Sattis Studio logo" />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="pt-8 md:pt-0">

            {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
