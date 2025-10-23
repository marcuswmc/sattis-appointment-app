import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { AppointmentsProvider } from "@/hooks/appointments-context";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Salon Management System",
  description: "Professional appointment management for salons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className}`} suppressHydrationWarning>
        <Suspense>
          <AuthProvider>
            <AppointmentsProvider>
              {children}
              <Toaster />
            </AppointmentsProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
