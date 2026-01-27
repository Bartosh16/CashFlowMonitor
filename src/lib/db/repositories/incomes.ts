import type { Income } from "@/lib/types";
import { getTable, setTable } from "@/lib/storage";
import { getNextId } from "@/lib/storage/helpers";

export async function listIncomes(month?: string) {
  const items = await getTable<"incomes">("incomes", []);
  const filtered = month ? items.filter((income) => income.date.startsWith(month)) : items;
  return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

export async function listIncomesByYear(year: string) {
  const items = await getTable<"incomes">("incomes", []);
  return items
    .filter((income) => income.date.startsWith(year))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function createIncome(payload: Omit<Income, "id" | "created_at" | "updated_at">) {
  const now = new Date().toISOString();
  const items = await getTable<"incomes">("incomes", []);
  const income: Income = {
    id: getNextId(items),
    ...payload,
    created_at: now,
    updated_at: now
  };
  await setTable("incomes", [...items, income]);
}

export async function deleteIncome(id: number) {
  const items = await getTable<"incomes">("incomes", []);
  await setTable(
    "incomes",
    items.filter((income) => income.id !== id)
  );
}
