import { getDb } from "@/lib/db/client";
import type { Income } from "@/lib/types";

export async function listIncomes(month?: string) {
  const db = await getDb();
  if (month) {
    return db.select<Income[]>(
      "SELECT * FROM incomes WHERE substr(date, 1, 7) = $1 ORDER BY date DESC;",
      [month]
    );
  }
  return db.select<Income[]>("SELECT * FROM incomes ORDER BY date DESC;");
}

export async function listIncomesByYear(year: string) {
  const db = await getDb();
  return db.select<Income[]>(
    "SELECT * FROM incomes WHERE substr(date, 1, 4) = $1 ORDER BY date ASC;",
    [year]
  );
}

export async function createIncome(payload: Omit<Income, "id" | "created_at" | "updated_at">) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO incomes (date, contractor, title, net_amount, vat_amount, gross_amount, invoice_ref, notes, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9);`,
    [
      payload.date,
      payload.contractor,
      payload.title,
      payload.net_amount,
      payload.vat_amount,
      payload.gross_amount,
      payload.invoice_ref ?? null,
      payload.notes ?? null,
      now
    ]
  );
}

export async function deleteIncome(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM incomes WHERE id = $1;", [id]);
}
