import { getDb } from "@/lib/db/client";
import type { PrivateExpense, PrivateRecurringExpense, RecurringBusinessPayment } from "@/lib/types";

export async function listRecurringBusinessPayments() {
  const db = await getDb();
  return db.select<RecurringBusinessPayment[]>(
    "SELECT * FROM recurring_business_payments ORDER BY created_at DESC;"
  );
}

export async function createRecurringBusinessPayment(
  payload: Omit<RecurringBusinessPayment, "id" | "created_at" | "updated_at">
) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO recurring_business_payments (name, amount, active, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$4);`,
    [payload.name, payload.amount, payload.active, now]
  );
}

export async function listPrivateOneTimeExpenses(month?: string) {
  const db = await getDb();
  if (month) {
    return db.select<PrivateExpense[]>(
      "SELECT * FROM private_one_time_expenses WHERE substr(date, 1, 7) = $1 ORDER BY date DESC;",
      [month]
    );
  }
  return db.select<PrivateExpense[]>("SELECT * FROM private_one_time_expenses ORDER BY date DESC;");
}

export async function createPrivateOneTimeExpense(
  payload: Omit<PrivateExpense, "id" | "created_at" | "updated_at">
) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO private_one_time_expenses (date, amount, description, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$4);`,
    [payload.date, payload.amount, payload.description, now]
  );
}

export async function listPrivateFutureExpenses(month?: string) {
  const db = await getDb();
  if (month) {
    return db.select<PrivateExpense[]>(
      "SELECT * FROM private_future_expenses WHERE substr(date, 1, 7) = $1 ORDER BY date DESC;",
      [month]
    );
  }
  return db.select<PrivateExpense[]>("SELECT * FROM private_future_expenses ORDER BY date DESC;");
}

export async function createPrivateFutureExpense(
  payload: Omit<PrivateExpense, "id" | "created_at" | "updated_at">
) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO private_future_expenses (date, amount, description, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$4);`,
    [payload.date, payload.amount, payload.description, now]
  );
}

export async function listPrivateRecurringExpenses() {
  const db = await getDb();
  return db.select<PrivateRecurringExpense[]>(
    "SELECT * FROM private_recurring_expenses ORDER BY created_at DESC;"
  );
}

export async function createPrivateRecurringExpense(
  payload: Omit<PrivateRecurringExpense, "id" | "created_at" | "updated_at">
) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO private_recurring_expenses (description, amount, interval, active, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$5);`,
    [payload.description, payload.amount, payload.interval, payload.active, now]
  );
}
