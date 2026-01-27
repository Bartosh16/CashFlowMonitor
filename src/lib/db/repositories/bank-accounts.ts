import type { BankAccount } from "@/lib/types";
import { getTable, setTable } from "@/lib/storage";
import { getNextId } from "@/lib/storage/helpers";

export async function listBankAccounts() {
  const items = await getTable<"bank_accounts">("bank_accounts", []);
  return [...items].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function createBankAccount(payload: Omit<BankAccount, "id" | "created_at" | "updated_at">) {
  const now = new Date().toISOString();
  const items = await getTable<"bank_accounts">("bank_accounts", []);
  const account: BankAccount = {
    id: getNextId(items),
    ...payload,
    created_at: now,
    updated_at: now
  };
  await setTable("bank_accounts", [...items, account]);
}

export async function updateBankAccountBalance(id: number, balance: number) {
  const now = new Date().toISOString();
  const items = await getTable<"bank_accounts">("bank_accounts", []);
  await setTable(
    "bank_accounts",
    items.map((account) =>
      account.id === id
        ? {
            ...account,
            balance,
            updated_at: now
          }
        : account
    )
  );
}

export async function deleteBankAccount(id: number) {
  const items = await getTable<"bank_accounts">("bank_accounts", []);
  await setTable(
    "bank_accounts",
    items.filter((account) => account.id !== id)
  );
}
