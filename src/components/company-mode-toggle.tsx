"use client";

import { useEffect, useState } from "react";
import { useEntitlements } from "@/lib/hooks/useEntitlements";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "cfm-company-mode";

export default function CompanyModeToggle() {
  const { data } = useEntitlements();
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setEnabled(stored === "company");
  }, []);

  const toggle = () => {
    if (data?.company_mode_enabled === 0 && !enabled) {
      router.push("/upgrade");
      return;
    }
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, next ? "company" : "private");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
    >
      Tryb: {enabled ? "Firma" : "Prywatnie"}
    </button>
  );
}
