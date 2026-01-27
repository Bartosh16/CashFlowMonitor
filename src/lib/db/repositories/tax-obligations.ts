import type { Payment, TaxObligation, TaxObligationType } from "@/lib/types";
import { getTable, setTable } from "@/lib/storage";
import { getNextId } from "@/lib/storage/helpers";

export async function listTaxObligations(month: string) {
  const [year, monthStr] = month.split("-");
  const items = await getTable<"tax_obligations">("tax_obligations", []);
  return items
    .filter((item) => item.month === Number(monthStr) && item.year === Number(year))
    .sort((a, b) => a.type.localeCompare(b.type));
}

export async function upsertTaxObligation(payload: Omit<TaxObligation, "id" | "created_at" | "updated_at">) {
  const now = new Date().toISOString();
  const items = await getTable<"tax_obligations">("tax_obligations", []);
  const existing = items.find(
    (item) => item.type === payload.type && item.month === payload.month && item.year === payload.year
  );
  if (existing) {
    const updated: TaxObligation = {
      ...existing,
      ...payload,
      updated_at: now
    };
    await setTable(
      "tax_obligations",
      items.map((item) => (item.id === existing.id ? updated : item))
    );
    return;
  }
  const obligation: TaxObligation = {
    id: getNextId(items),
    ...payload,
    created_at: now,
    updated_at: now
  };
  await setTable("tax_obligations", [...items, obligation]);
}

export async function listPayments(obligationId: number) {
  const items = await getTable<"payments">("payments", []);
  return items
    .filter((payment) => payment.obligation_id === obligationId)
    .sort((a, b) => b.payment_date.localeCompare(a.payment_date));
}

export async function createPayment(payload: Omit<Payment, "id" | "created_at" | "updated_at">) {
  const now = new Date().toISOString();
  const payments = await getTable<"payments">("payments", []);
  const payment: Payment = {
    id: getNextId(payments),
    ...payload,
    created_at: now,
    updated_at: now
  };
  const updatedPayments = [...payments, payment];
  await setTable("payments", updatedPayments);

  const obligations = await getTable<"tax_obligations">("tax_obligations", []);
  const paidAmount = updatedPayments
    .filter((entry) => entry.obligation_id === payload.obligation_id)
    .reduce((total, entry) => total + entry.amount, 0);
  await setTable(
    "tax_obligations",
    obligations.map((item) =>
      item.id === payload.obligation_id ? { ...item, paid_amount: paidAmount, updated_at: now } : item
    )
  );
}

export async function sumPaymentsByType(month: string, type: TaxObligationType) {
  const [year, monthStr] = month.split("-");
  const obligations = await getTable<"tax_obligations">("tax_obligations", []);
  const payments = await getTable<"payments">("payments", []);
  const obligationIds = new Set(
    obligations
      .filter((item) => item.type === type && item.month === Number(monthStr) && item.year === Number(year))
      .map((item) => item.id)
  );
  return payments
    .filter((payment) => obligationIds.has(payment.obligation_id))
    .reduce((total, payment) => total + payment.amount, 0);
}

export async function setObligationStatus(id: number, status: TaxObligation["status"]) {
  const now = new Date().toISOString();
  const obligations = await getTable<"tax_obligations">("tax_obligations", []);
  await setTable(
    "tax_obligations",
    obligations.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            updated_at: now
          }
        : item
    )
  );
}
