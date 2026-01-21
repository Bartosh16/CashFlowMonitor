import { getDb } from "@/lib/db/client";
import type { BankAccount } from "@/lib/types";

export async function listBankAccounts() {
  const db = await getDb();
  return db.select<BankAccount[]>("SELECT * FROM bank_accounts ORDER BY created_at DESC;");
}

export async function createBankAccount(payload: Omit<BankAccount, "id" | "created_at" | "updated_at">) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO bank_accounts (name, balance, created_at, updated_at)
     VALUES ($1,$2,$3,$3);`,
    [payload.name, payload.balance, now]
  );
}

export async function updateBankAccountBalance(id: number, balance: number) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE bank_accounts SET balance = $1, updated_at = $2 WHERE id = $3;`,
    [balance, now, id]
  );
}

export async function deleteBankAccount(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM bank_accounts WHERE id = $1;", [id]);
}
