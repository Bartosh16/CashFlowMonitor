export type Plan = "FREE" | "PREMIUM" | "BUSINESS";

export interface Entitlements {
  id: number;
  plan: Plan;
  ads_enabled: number;
  company_mode_enabled: number;
  updated_at: string | null;
}

export interface Settings {
  id: number;
  tax_system: "SCALE" | "LINEAR" | "LUMP_SUM";
  is_vat_payer: number;
  tax_threshold: number;
  tax_rate_1: number;
  tax_rate_2: number;
  health_rate: number;
  tax_free_deduction: number;
  zus_fixed: number;
  profit_first_rate: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Income {
  id: number;
  date: string;
  contractor: string;
  title: string;
  net_amount: number;
  vat_amount: number;
  gross_amount: number;
  invoice_ref?: string | null;
  notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  created_at: string | null;
}

export interface Expense {
  id: number;
  date: string;
  amount: number;
  description: string;
  category_id: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface BankAccount {
  id: number;
  name: string;
  balance: number;
  created_at: string | null;
  updated_at: string | null;
}

export type TaxObligationType = "PIT" | "ZUS" | "VAT";

export interface TaxObligation {
  id: number;
  type: TaxObligationType;
  month: number;
  year: number;
  projected_amount: number;
  actual_amount: number | null;
  paid_amount: number;
  due_date: string;
  status: "pending" | "partially_paid" | "paid" | "overdue";
  created_at: string | null;
  updated_at: string | null;
}

export interface Payment {
  id: number;
  obligation_id: number;
  amount: number;
  payment_date: string;
  confirmation_ref?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RecurringBusinessPayment {
  id: number;
  name: string;
  amount: number;
  active: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PrivateExpense {
  id: number;
  date: string;
  amount: number;
  description: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface PrivateRecurringExpense {
  id: number;
  description: string;
  amount: number;
  interval: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  active: number;
  created_at: string | null;
  updated_at: string | null;
}
