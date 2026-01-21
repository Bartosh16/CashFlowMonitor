import { getDb } from "@/lib/db/client";
import type { Settings } from "@/lib/types";

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const rows = await db.select<Settings[]>("SELECT * FROM settings WHERE id = 1 LIMIT 1;");
  return rows[0];
}

export async function updateSettings(values: Partial<Settings>) {
  const db = await getDb();
  const now = new Date().toISOString();
  const fields = Object.keys(values);
  if (fields.length === 0) return;

  const setters = fields.map((field, index) => `${field} = $${index + 1}`);
  const params = fields.map((field) => (values as Record<string, unknown>)[field]);
  params.push(now);

  await db.execute(
    `UPDATE settings SET ${setters.join(", ")}, updated_at = $${params.length} WHERE id = 1;`,
    params
  );
}
