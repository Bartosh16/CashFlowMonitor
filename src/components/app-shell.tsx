"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import PlanBadge from "@/components/plan-badge";
import AdsBanner from "@/components/ads-banner";
import CompanyModeToggle from "@/components/company-mode-toggle";
import DatabaseGate from "@/components/database-gate";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/przychody", label: "Przychody" },
  { href: "/koszty", label: "Koszty" },
  { href: "/balans", label: "Balans" },
  { href: "/ustawienia", label: "Ustawienia" }
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold">CashFlow Monitor</p>
            <p className="text-xs text-slate-500">
              To są szacunki - skonsultuj z księgowym.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CompanyModeToggle />
            <PlanBadge />
          </div>
        </div>
        <nav className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-6xl gap-4 px-6 py-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-white",
                  pathname === link.href && "bg-white text-brand-700 shadow-sm"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
        <DatabaseGate>{children}</DatabaseGate>
      </main>
      <AdsBanner />
    </div>
  );
}
