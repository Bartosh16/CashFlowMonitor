import type { Entitlements, Plan } from "@/lib/types";
import { getTable, setTable } from "@/lib/storage";

export async function getEntitlements(): Promise<Entitlements> {
  const entitlements = await getTable<"entitlements">("entitlements", null);
  if (!entitlements) {
    throw new Error("Brak ustawień uprawnień. Uruchom onboarding ponownie.");
  }
  return entitlements;
}

export async function updateEntitlements(plan: Plan) {
  const entitlements = await getTable<"entitlements">("entitlements", null);
  if (!entitlements) {
    throw new Error("Nie znaleziono profilu uprawnień.");
  }
  const now = new Date().toISOString();
  const adsEnabled = plan === "FREE" ? 1 : 0;
  const companyModeEnabled = plan === "BUSINESS" ? 1 : 0;

  await setTable("entitlements", {
    ...entitlements,
    plan,
    ads_enabled: adsEnabled,
    company_mode_enabled: companyModeEnabled,
    updated_at: now
  });
}
