import { getDb } from "@/lib/db/client";
import type { Payment, TaxObligation, TaxObligationType } from "@/lib/types";

export async function listTaxObligations(month: string) {
  const db = await getDb();
  const [year, monthStr] = month.split("-");
  return db.select<TaxObligation[]>(
    "SELECT * FROM tax_obligations WHERE month = $1 AND year = $2 ORDER BY type ASC;",
    [Number(monthStr), Number(year)]
  );
}

export async function upsertTaxObligation(payload: Omit<TaxObligation, "id" | "created_at" | "updated_at">) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO tax_obligations (type, month, year, projected_amount, actual_amount, paid_amount, due_date, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9)
     ON CONFLICT(type, month, year)
     DO UPDATE SET projected_amount = excluded.projected_amount,
                   actual_amount = excluded.actual_amount,
                   paid_amount = excluded.paid_amount,
                   due_date = excluded.due_date,
                   status = excluded.status,
                   updated_at = excluded.updated_at;`,
    [
      payload.type,
      payload.month,
      payload.year,
      payload.projected_amount,
      payload.actual_amount,
      payload.paid_amount,
      payload.due_date,
      payload.status,
      now
    ]
  );
}

export async function listPayments(obligationId: number) {
  const db = await getDb();
  return db.select<Payment[]>(
    "SELECT * FROM payments WHERE obligation_id = $1 ORDER BY payment_date DESC;",
    [obligationId]
  );
}

export async function createPayment(payload: Omit<Payment, "id" | "created_at" | "updated_at">) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO payments (obligation_id, amount, payment_date, confirmation_ref, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$5);`,
    [payload.obligation_id, payload.amount, payload.payment_date, payload.confirmation_ref ?? null, now]
  );
  await db.execute(
    `UPDATE tax_obligations
     SET paid_amount = (
       SELECT COALESCE(SUM(amount), 0) FROM payments WHERE obligation_id = $1
     ),
     updated_at = $2
     WHERE id = $1;`,
    [payload.obligation_id, now]
  );
}

export async function sumPaymentsByType(month: string, type: TaxObligationType) {
  const db = await getDb();
  const [year, monthStr] = month.split("-");
  const rows = await db.select<{ total: number }[]>(
    `SELECT SUM(p.amount) as total
     FROM payments p
     JOIN tax_obligations t ON t.id = p.obligation_id
     WHERE t.type = $1 AND t.month = $2 AND t.year = $3;`,
    [type, Number(monthStr), Number(year)]
  );
  return rows[0]?.total ?? 0;
}

export async function setObligationStatus(id: number, status: TaxObligation["status"]) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE tax_obligations SET status = $1, updated_at = $2 WHERE id = $3;`,
    [status, now, id]
  );
}
