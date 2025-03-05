"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList, Users, Scissors, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { useAppointments } from "@/hooks/appointments-context";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface DashboardNavProps {
  user: User;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";
  const { confirmedCount } = useAppointments();

  const navItems: NavItem[] = [
    {
      title: "Marcações",
      href: "/dashboard/appointments",
      icon: <Calendar className="mr-2 h-5 w-5" />,
    },
    {
      title: "Histórico",
      href: "/dashboard/history",
      icon: <ClipboardList className="mr-2 h-5 w-5" />,
    },
    {
      title: "Serviços",
      href: "/dashboard/services",
      icon: <Scissors className="mr-2 h-5 w-5" />,
      adminOnly: true,
    },
    {
      title: "Profissionais",
      href: "/dashboard/professionals",
      icon: <Users className="mr-2 h-5 w-5" />,
      adminOnly: true,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between py-4">
      <nav className="space-y-1 px-2">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-gray-200 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-200 transition-colors"
              )}
            >
              <div className="flex items-center">
                {item.icon}
                {item.title}
              </div>
              {item.title === "Marcações" && confirmedCount > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {confirmedCount > 99 ? "99+" : confirmedCount}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-gray-200 hover:text-foreground cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
