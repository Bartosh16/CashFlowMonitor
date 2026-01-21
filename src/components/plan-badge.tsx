"use client";

import { useEntitlements } from "@/lib/hooks/useEntitlements";

export default function PlanBadge() {
  const { data } = useEntitlements();

  return (
    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
      Plan: {data?.plan ?? "..."}
    </span>
  );
}
