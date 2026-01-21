"use client";

import { useEntitlements } from "@/lib/hooks/useEntitlements";
import { usePathname } from "next/navigation";

const hiddenRoutes = ["/ustawienia", "/balans", "/dashboard"]; // hide on critical paths

export default function AdsBanner() {
  const { data } = useEntitlements();
  const pathname = usePathname();

  if (!data || data.ads_enabled === 0) {
    return null;
  }

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-3 text-center text-xs text-slate-500">
        Reklamy wewnętrzne (house ads) - tu będzie miejsce na promocje planu Premium.
      </div>
    </div>
  );
}
