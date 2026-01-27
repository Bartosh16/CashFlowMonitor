import type {
  BankAccount,
  Entitlements,
  Expense,
  ExpenseCategory,
  Income,
  Payment,
  PrivateExpense,
  PrivateRecurringExpense,
  RecurringBusinessPayment,
  Settings,
  TaxObligation
} from "@/lib/types";
import { clearStore, getValue, setValue } from "@/lib/storage/indexeddb";

type TableName =
  | "settings"
  | "entitlements"
  | "incomes"
  | "expense_categories"
  | "expenses"
  | "recurring_business_payments"
  | "private_one_time_expenses"
  | "private_future_expenses"
  | "private_recurring_expenses"
  | "bank_accounts"
  | "tax_obligations"
  | "payments";

type TableMap = {
  settings: Settings | null;
  entitlements: Entitlements | null;
  incomes: Income[];
  expense_categories: ExpenseCategory[];
  expenses: Expense[];
  recurring_business_payments: RecurringBusinessPayment[];
  private_one_time_expenses: PrivateExpense[];
  private_future_expenses: PrivateExpense[];
  private_recurring_expenses: PrivateRecurringExpense[];
  bank_accounts: BankAccount[];
  tax_obligations: TaxObligation[];
  payments: Payment[];
};

const TABLES: TableName[] = [
  "settings",
  "entitlements",
  "incomes",
  "expense_categories",
  "expenses",
  "recurring_business_payments",
  "private_one_time_expenses",
  "private_future_expenses",
  "private_recurring_expenses",
  "bank_accounts",
  "tax_obligations",
  "payments"
];

export async function getTable<T extends TableName>(table: T, fallback: TableMap[T]): Promise<TableMap[T]> {
  const value = await getValue<TableMap[T]>(table);
  if (value === undefined) {
    await setValue(table, fallback);
    return fallback;
  }
  return value;
}

export async function setTable<T extends TableName>(table: T, value: TableMap[T]): Promise<void> {
  await setValue(table, value);
}

export async function exportData() {
  const entries = await Promise.all(TABLES.map(async (table) => [table, await getValue(table)] as const));
  return Object.fromEntries(entries);
}

export async function importData(payload: Record<string, unknown>) {
  await clearStore();
  await Promise.all(
    TABLES.map(async (table) => {
      if (Object.prototype.hasOwnProperty.call(payload, table)) {
        await setValue(table, payload[table]);
      }
    })
  );
}
