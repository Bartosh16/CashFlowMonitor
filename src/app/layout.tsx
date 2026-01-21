import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import AppShell from "@/components/app-shell";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "CashFlow Monitor",
  description: "Desktopowy monitor finansów dla firm i freelancerów."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
