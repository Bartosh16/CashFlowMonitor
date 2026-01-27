import type { Settings } from "@/lib/types";
import { getTable, setTable } from "@/lib/storage";

export async function getSettings(): Promise<Settings> {
  const settings = await getTable<"settings">("settings", null);
  if (!settings) {
    throw new Error("Brak ustawień podatkowych. Uruchom onboarding ponownie.");
  }
  return settings;
}

export async function updateSettings(values: Partial<Settings>) {
  const settings = await getTable<"settings">("settings", null);
  if (!settings) {
    throw new Error("Nie znaleziono ustawień podatkowych.");
  }
  const now = new Date().toISOString();
  await setTable("settings", {
    ...settings,
    ...values,
    updated_at: now
  });
}
