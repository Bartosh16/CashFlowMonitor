import { getTable, setTable } from "@/lib/storage";
import type { ExpenseCategory, Settings, Entitlements } from "@/lib/types";

export async function seedDatabase() {
  const now = new Date().toISOString();

  const settings = await getTable<"settings">("settings", null);
  if (!settings) {
    const defaultSettings: Settings = {
      id: 1,
      tax_system: "SCALE",
      is_vat_payer: 1,
      tax_threshold: 120000,
      tax_rate_1: 12,
      tax_rate_2: 32,
      health_rate: 9,
      tax_free_deduction: 3600,
      zus_fixed: 1927,
      profit_first_rate: 9,
      created_at: now,
      updated_at: now
    };
    await setTable("settings", defaultSettings);
  }

  const entitlements = await getTable<"entitlements">("entitlements", null);
  if (!entitlements) {
    const defaultEntitlements: Entitlements = {
      id: 1,
      plan: "FREE",
      ads_enabled: 1,
      company_mode_enabled: 0,
      updated_at: now
    };
    await setTable("entitlements", defaultEntitlements);
  }

  const categories = [
    "Biuro i narzędzia",
    "Marketing",
    "Księgowość",
    "Sprzęt i oprogramowanie",
    "Transport"
  ];

  const existingCategories = await getTable<"expense_categories">("expense_categories", []);
  if (existingCategories.length === 0) {
    const seeded: ExpenseCategory[] = categories.map((name, index) => ({
      id: index + 1,
      name,
      created_at: now
    }));
    await setTable("expense_categories", seeded);
  }
}
