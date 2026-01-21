import type { Expense, Income, Settings, TaxObligation } from "@/lib/types";

const VAT_RATE = 0.23;
const VAT_INPUT_RATE = 0.2;

export interface TaxProjectionInput {
  settings: Settings;
  month: string;
  incomes: Income[];
  expenses: Expense[];
  yearToDateIncome: Income[];
  yearToDateExpenses: Expense[];
}

export interface TaxProjectionResult {
  vatDue: number;
  pitDue: number;
  zusDue: number;
  profitFirst: number;
  obligations: Omit<TaxObligation, "id" | "created_at" | "updated_at">[];
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function getDueDate(month: string, type: TaxObligation["type"]) {
  const [year, monthStr] = month.split("-");
  const base = new Date(Number(year), Number(monthStr), 1);
  const dueDay = type === "VAT" ? 25 : 20;
  const due = new Date(base.getFullYear(), base.getMonth(), dueDay);
  return due.toISOString().slice(0, 10);
}

export function calculateTaxes(input: TaxProjectionInput): TaxProjectionResult {
  const { settings, month, incomes, expenses, yearToDateIncome, yearToDateExpenses } = input;

  const netIncome = incomes.reduce((sum, item) => sum + item.net_amount, 0);
  const costSum = expenses.reduce((sum, item) => sum + item.amount, 0);

  const vatOutput = settings.is_vat_payer ? netIncome * VAT_RATE : 0;
  const vatInput = settings.is_vat_payer ? costSum * VAT_INPUT_RATE : 0;
  const vatDue = round(Math.max(0, vatOutput - vatInput));

  const profitFirst = round(netIncome * (settings.profit_first_rate / 100));

  const yearIncome = yearToDateIncome.reduce((sum, item) => sum + item.net_amount, 0);
  const yearCosts = yearToDateExpenses.reduce((sum, item) => sum + item.amount, 0);
  const taxableBase = Math.max(0, yearIncome - yearCosts);

  const pitDueRaw = taxableBase <= settings.tax_threshold
    ? taxableBase * (settings.tax_rate_1 / 100)
    : settings.tax_threshold * (settings.tax_rate_1 / 100) +
      (taxableBase - settings.tax_threshold) * (settings.tax_rate_2 / 100);

  const pitDue = round(Math.max(0, pitDueRaw - settings.tax_free_deduction));

  const healthBase = Math.max(0, netIncome - costSum);
  const health = round(healthBase * (settings.health_rate / 100));
  const zusDue = round(settings.zus_fixed + Math.max(0, health));

  const obligations: Omit<TaxObligation, "id" | "created_at" | "updated_at">[] = [
    {
      type: "PIT",
      month: Number(month.split("-")[1]),
      year: Number(month.split("-")[0]),
      projected_amount: pitDue,
      actual_amount: null,
      paid_amount: 0,
      due_date: getDueDate(month, "PIT"),
      status: "pending"
    },
    {
      type: "ZUS",
      month: Number(month.split("-")[1]),
      year: Number(month.split("-")[0]),
      projected_amount: zusDue,
      actual_amount: null,
      paid_amount: 0,
      due_date: getDueDate(month, "ZUS"),
      status: "pending"
    }
  ];

  if (settings.is_vat_payer) {
    obligations.push({
      type: "VAT",
      month: Number(month.split("-")[1]),
      year: Number(month.split("-")[0]),
      projected_amount: vatDue,
      actual_amount: null,
      paid_amount: 0,
      due_date: getDueDate(month, "VAT"),
      status: "pending"
    });
  }

  return { vatDue, pitDue, zusDue, profitFirst, obligations };
}

export function updateObligationStatus(obligation: TaxObligation) {
  const target = obligation.actual_amount ?? obligation.projected_amount;
  const today = new Date().toISOString().slice(0, 10);
  if (obligation.paid_amount >= target) return "paid" as const;
  if (obligation.paid_amount > 0) return "partially_paid" as const;
  if (today > obligation.due_date) return "overdue" as const;
  return "pending" as const;
}
