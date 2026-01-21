import { getDb } from "@/lib/db/client";
import { migrations } from "@/lib/db/migrations";

const MIGRATION_TABLE = "schema_migrations";

export async function migrate() {
  const db = await getDb();
  await db.execute(`CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (id INTEGER PRIMARY KEY);`);
  const rows = await db.select<{ id: number }[]>(
    `SELECT id FROM ${MIGRATION_TABLE} ORDER BY id ASC;`
  );
  const applied = new Set(rows.map((row) => row.id));

  for (const migration of migrations) {
    if (!applied.has(migration.id)) {
      await db.execute(migration.sql);
      await db.execute(`INSERT INTO ${MIGRATION_TABLE} (id) VALUES ($1);`, [
        migration.id
      ]);
    }
  }
}
