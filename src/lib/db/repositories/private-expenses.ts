import type { PrivateExpense, PrivateRecurringExpense, RecurringBusinessPayment } from "@/lib/types";
import { getTable, setTable } from "@/lib/storage";
import { getNextId } from "@/lib/storage/helpers";

export async function listRecurringBusinessPayments() {
  const items = await getTable<"recurring_business_payments">("recurring_business_payments", []);
  return [...items].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function createRecurringBusinessPayment(
  payload: Omit<RecurringBusinessPayment, "id" | "created_at" | "updated_at">
) {
  const now = new Date().toISOString();
  const items = await getTable<"recurring_business_payments">("recurring_business_payments", []);
  const payment: RecurringBusinessPayment = {
    id: getNextId(items),
    ...payload,
    created_at: now,
    updated_at: now
  };
  await setTable("recurring_business_payments", [...items, payment]);
}

export async function listPrivateOneTimeExpenses(month?: string) {
  const items = await getTable<"private_one_time_expenses">("private_one_time_expenses", []);
  const filtered = month ? items.filter((expense) => expense.date.startsWith(month)) : items;
  return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

export async function createPrivateOneTimeExpense(
  payload: Omit<PrivateExpense, "id" | "created_at" | "updated_at">
) {
  const now = new Date().toISOString();
  const items = await getTable<"private_one_time_expenses">("private_one_time_expenses", []);
  const expense: PrivateExpense = {
    id: getNextId(items),
    ...payload,
    created_at: now,
    updated_at: now
  };
  await setTable("private_one_time_expenses", [...items, expense]);
}

export async function listPrivateFutureExpenses(month?: string) {
  const items = await getTable<"private_future_expenses">("private_future_expenses", []);
  const filtered = month ? items.filter((expense) => expense.date.startsWith(month)) : items;
  return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

export async function createPrivateFutureExpense(
  payload: Omit<PrivateExpense, "id" | "created_at" | "updated_at">
) {
  const now = new Date().toISOString();
  const items = await getTable<"private_future_expenses">("private_future_expenses", []);
  const expense: PrivateExpense = {
    id: getNextId(items),
    ...payload,
    created_at: now,
    updated_at: now
  };
  await setTable("private_future_expenses", [...items, expense]);
}

export async function listPrivateRecurringExpenses() {
  const items = await getTable<"private_recurring_expenses">("private_recurring_expenses", []);
  return [...items].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function createPrivateRecurringExpense(
  payload: Omit<PrivateRecurringExpense, "id" | "created_at" | "updated_at">
) {
  const now = new Date().toISOString();
  const items = await getTable<"private_recurring_expenses">("private_recurring_expenses", []);
  const expense: PrivateRecurringExpense = {
    id: getNextId(items),
    ...payload,
    created_at: now,
    updated_at: now
  };
  await setTable("private_recurring_expenses", [...items, expense]);
}
