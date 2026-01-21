import { describe, expect, it } from "vitest";
import { calculateTaxes } from "@/lib/domain/tax-engine";
import type { Settings } from "@/lib/types";

const settings: Settings = {
  id: 1,
  tax_system: "SCALE",
  is_vat_payer: 1,
  tax_threshold: 120000,
  tax_rate_1: 12,
  tax_rate_2: 32,
  health_rate: 9,
  tax_free_deduction: 3600,
  zus_fixed: 1927,
  profit_first_rate: 9,
  created_at: null,
  updated_at: null
};

describe("TaxEngine", () => {
  it("calculates vat and pit estimates", () => {
    const result = calculateTaxes({
      settings,
      month: "2024-06",
      incomes: [
        {
          id: 1,
          date: "2024-06-10",
          contractor: "ACME",
          title: "Project",
          net_amount: 10000,
          vat_amount: 2300,
          gross_amount: 12300,
          created_at: null,
          updated_at: null
        }
      ],
      expenses: [
        {
          id: 1,
          date: "2024-06-05",
          amount: 2000,
          description: "Tools",
          category_id: 1,
          created_at: null,
          updated_at: null
        }
      ],
      yearToDateIncome: [],
      yearToDateExpenses: []
    });

    expect(result.vatDue).toBeGreaterThan(0);
    expect(result.pitDue).toBeGreaterThanOrEqual(0);
    expect(result.zusDue).toBeGreaterThan(0);
  });
});
