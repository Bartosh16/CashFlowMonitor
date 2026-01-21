import { getDb } from "@/lib/db/client";
import type { Entitlements, Plan } from "@/lib/types";

export async function getEntitlements(): Promise<Entitlements> {
  const db = await getDb();
  const rows = await db.select<Entitlements[]>(
    "SELECT * FROM entitlements WHERE id = 1 LIMIT 1;"
  );
  return rows[0];
}

export async function updateEntitlements(plan: Plan) {
  const db = await getDb();
  const now = new Date().toISOString();
  const adsEnabled = plan === "FREE" ? 1 : 0;
  const companyModeEnabled = plan === "BUSINESS" ? 1 : 0;

  await db.execute(
    `UPDATE entitlements
     SET plan = $1, ads_enabled = $2, company_mode_enabled = $3, updated_at = $4
     WHERE id = 1;`,
    [plan, adsEnabled, companyModeEnabled, now]
  );
}
