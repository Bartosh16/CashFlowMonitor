import type { Entitlements, Plan } from "@/lib/types";

export function planToEntitlements(plan: Plan): Entitlements {
  return {
    id: 1,
    plan,
    ads_enabled: plan === "FREE" ? 1 : 0,
    company_mode_enabled: plan === "BUSINESS" ? 1 : 0,
    updated_at: new Date().toISOString()
  };
}

export function canUseCompanyMode(entitlements: Entitlements) {
  return entitlements.company_mode_enabled === 1;
}
