import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { AppointmentsProvider } from "@/hooks/appointments-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import Loading from "./loading";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sattis App Admin",
  description: "Backoffice Admin - Sattis App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppointmentsProvider>
              <Suspense
                fallback={
                  <Loading />
                }
              >
                {children}
              </Suspense>
              <Toaster />
            </AppointmentsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
