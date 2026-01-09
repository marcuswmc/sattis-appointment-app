"use client"

import { useSession } from "next-auth/react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SiteHeader() {
  const { data: session } = useSession()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          {session?.user && (
            <>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium">{session.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {session.user.email}
                </span>
              </div>
              <Avatar className="size-8 hidden md:flex">
                <AvatarImage
                  src="/sattis-logo.png"
                  alt={session.user.name || "User"}
                />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
