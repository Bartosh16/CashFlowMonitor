import { getDb } from "@/lib/db/client";

export async function seedDatabase() {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT OR IGNORE INTO settings (id, created_at, updated_at) VALUES (1, $1, $1);`,
    [now]
  );
  await db.execute(
    `INSERT OR IGNORE INTO entitlements (id, plan, ads_enabled, company_mode_enabled, updated_at)
     VALUES (1, 'FREE', 1, 0, $1);`,
    [now]
  );

  const categories = [
    "Biuro i narzędzia",
    "Marketing",
    "Księgowość",
    "Sprzęt i oprogramowanie",
    "Transport"
  ];

  for (const name of categories) {
    await db.execute(
      `INSERT OR IGNORE INTO expense_categories (name, created_at) VALUES ($1, $2);`,
      [name, now]
    );
  }
}
