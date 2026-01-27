import type { Expense, ExpenseCategory } from "@/lib/types";
import { getTable, setTable } from "@/lib/storage";
import { getNextId } from "@/lib/storage/helpers";

export async function listExpenseCategories() {
  const items = await getTable<"expense_categories">("expense_categories", []);
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export async function createExpenseCategory(name: string) {
  const now = new Date().toISOString();
  const items = await getTable<"expense_categories">("expense_categories", []);
  if (items.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
    return;
  }
  const category: ExpenseCategory = {
    id: getNextId(items),
    name,
    created_at: now
  };
  await setTable("expense_categories", [...items, category]);
}

export async function listExpenses(month?: string) {
  const items = await getTable<"expenses">("expenses", []);
  const filtered = month ? items.filter((expense) => expense.date.startsWith(month)) : items;
  return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

export async function listExpensesByYear(year: string) {
  const items = await getTable<"expenses">("expenses", []);
  return items
    .filter((expense) => expense.date.startsWith(year))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function createExpense(payload: Omit<Expense, "id" | "created_at" | "updated_at">) {
  const now = new Date().toISOString();
  const items = await getTable<"expenses">("expenses", []);
  const expense: Expense = {
    id: getNextId(items),
    ...payload,
    created_at: now,
    updated_at: now
  };
  await setTable("expenses", [...items, expense]);
}

export async function deleteExpense(id: number) {
  const items = await getTable<"expenses">("expenses", []);
  await setTable(
    "expenses",
    items.filter((expense) => expense.id !== id)
  );
}
