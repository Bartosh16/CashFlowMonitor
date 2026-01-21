import { describe, expect, it } from "vitest";
import { calculateBalance } from "@/lib/domain/balance-engine";

describe("BalanceEngine", () => {
  it("sums balances and reserves", () => {
    const result = calculateBalance({
      bankAccounts: [
        { id: 1, name: "Main", balance: 10000, created_at: null, updated_at: null }
      ],
      obligations: [
        {
          id: 1,
          type: "PIT",
          month: 6,
          year: 2024,
          projected_amount: 2000,
          actual_amount: null,
          paid_amount: 500,
          due_date: "2024-07-20",
          status: "pending",
          created_at: null,
          updated_at: null
        }
      ],
      profitFirst: 900,
      privateOneTime: [
        { id: 1, date: "2024-06-12", amount: 300, description: "Trip", created_at: null, updated_at: null }
      ],
      privateFuture: [],
      privateRecurring: [
        { id: 1, description: "Gym", amount: 200, interval: "MONTHLY", active: 1, created_at: null, updated_at: null }
      ],
      recurringBusiness: []
    });

    expect(result.totalBalance).toBe(10000);
    expect(result.reservedBalance).toBeGreaterThan(0);
    expect(result.availableBalance).toBeLessThan(result.totalBalance);
  });
});
