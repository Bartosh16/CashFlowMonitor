import { getDb } from "@/lib/db/client";
import type { Expense, ExpenseCategory } from "@/lib/types";

export async function listExpenseCategories() {
  const db = await getDb();
  return db.select<ExpenseCategory[]>("SELECT * FROM expense_categories ORDER BY name ASC;");
}

export async function createExpenseCategory(name: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO expense_categories (name, created_at) VALUES ($1, $2);`,
    [name, now]
  );
}

export async function listExpenses(month?: string) {
  const db = await getDb();
  if (month) {
    return db.select<Expense[]>(
      "SELECT * FROM expenses WHERE substr(date, 1, 7) = $1 ORDER BY date DESC;",
      [month]
    );
  }
  return db.select<Expense[]>("SELECT * FROM expenses ORDER BY date DESC;");
}

export async function listExpensesByYear(year: string) {
  const db = await getDb();
  return db.select<Expense[]>(
    "SELECT * FROM expenses WHERE substr(date, 1, 4) = $1 ORDER BY date ASC;",
    [year]
  );
}

export async function createExpense(payload: Omit<Expense, "id" | "created_at" | "updated_at">) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO expenses (date, amount, description, category_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$5);`,
    [payload.date, payload.amount, payload.description, payload.category_id, now]
  );
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM expenses WHERE id = $1;", [id]);
}
